import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const gemini = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AIConfig {
    currentProvider: string
    fallbackEnabled: boolean
    fallbackProvider: string
}

async function getAIConfig(): Promise<AIConfig> {
    try {
        const { data } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'ai_config')
            .single()

        return data?.value || {
            currentProvider: 'gpt5-nano',
            fallbackEnabled: true,
            fallbackProvider: 'gemini-2.0-flash'
        }
    } catch {
        return {
            currentProvider: 'gpt5-nano',
            fallbackEnabled: true,
            fallbackProvider: 'gemini-2.0-flash'
        }
    }
}

// Incrementar contador de scans do usuário
async function incrementScanCount(userId: string): Promise<void> {
    try {
        // Primeiro busca o valor atual
        const { data: access } = await supabaseAdmin
            .from('ps360_access')
            .select('ai_scans_used')
            .eq('user_id', userId)
            .single()

        const currentCount = access?.ai_scans_used || 0

        // Incrementa o contador
        await supabaseAdmin
            .from('ps360_access')
            .update({
                ai_scans_used: currentCount + 1
            })
            .eq('user_id', userId)

        console.log(`📊 [Scan Counter] Usuário ${userId}: ${currentCount} -> ${currentCount + 1} scans`)
    } catch (error) {
        console.error('❌ [Scan Counter] Erro ao incrementar:', error)
    }
}

const SYSTEM_PROMPT = `Você é um especialista em extrair ingredientes de receitas culinárias.
Analise o texto/imagem e extraia TODOS os ingredientes com suas quantidades.

Retorne APENAS um JSON válido no formato:
{
  "recipe_name": "Nome da receita",
  "yield": 10,
  "yield_unit": "unidades",
  "ingredients": [
    { "name": "Farinha de trigo", "quantity": 500, "unit": "g" },
    { "name": "Açúcar", "quantity": 200, "unit": "g" }
  ]
}

Ingredientes já cadastrados no sistema (use nomes EXATAMENTE iguais se encontrar correspondência):
%INGREDIENTS%

Se um ingrediente NÃO existir na lista acima, inclua-o mesmo assim com o nome mais comum.
Seja preciso nas quantidades e unidades.
Converta unidades informais (ex: "2 xícaras" = 280g, "1 colher de sopa" = 15g).
Se a receita não tiver nome claro, crie um baseado nos ingredientes.`

function parseExistingIngredients(existingIngredients: string | null): string[] {
    if (!existingIngredients) return []
    try {
        const parsed = JSON.parse(existingIngredients)
        return parsed.map((i: { name: string }) => i.name.toLowerCase())
    } catch {
        return []
    }
}

function buildPrompt(ingredientsList: string[]): string {
    const ingredientsStr = ingredientsList.length > 0
        ? ingredientsList.join(', ')
        : 'Nenhum cadastrado ainda'
    return SYSTEM_PROMPT.replace('%INGREDIENTS%', ingredientsStr)
}

function extractJsonFromResponse(content: string): object | null {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    try {
        return JSON.parse(jsonMatch[0])
    } catch {
        return null
    }
}

function markExistingIngredients(extracted: { ingredients?: { name: string; quantity: number; unit: string }[] }, ingredientsList: string[]): object {
    if (!extracted.ingredients || !Array.isArray(extracted.ingredients)) return extracted

    return {
        ...extracted,
        ingredients: extracted.ingredients.map(ing => ({
            ...ing,
            exists: ingredientsList.includes(ing.name.toLowerCase())
        }))
    }
}

// Process with GPT-5 nano
async function callOpenAI(prompt: string, imageBase64?: string): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: prompt }
    ]

    if (imageBase64) {
        messages.push({
            role: 'user',
            content: [
                {
                    type: 'image_url',
                    image_url: {
                        url: imageBase64.startsWith('data:')
                            ? imageBase64
                            : `data:image/jpeg;base64,${imageBase64}`,
                        detail: 'low' // Use low detail to reduce tokens
                    }
                },
                { type: 'text', text: 'Extraia os ingredientes desta receita e retorne apenas o JSON.' }
            ]
        })
    } else {
        messages.push({
            role: 'user',
            content: 'Extraia os ingredientes da receita informada e retorne apenas o JSON.'
        })
    }

    console.log('🔍 [OpenAI Request] Sending request to GPT-5 nano...')

    const response = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages,
        max_completion_tokens: 16000, // Increased significantly for reasoning models
        response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content || ''
    console.log('🔍 [OpenAI Response] Finish reason:', response.choices[0]?.finish_reason)
    console.log('🔍 [OpenAI Response] Content length:', content.length)
    console.log('🔍 [OpenAI Response] First 500 chars:', content.substring(0, 500))

    return content
}

// Process with Gemini
async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
    const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
        { text: prompt }
    ]

    if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
            }
        })
    }

    const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts }]
    })

    return response.text || ''
}

// Process PDF input
async function processPdfInput(buffer: Buffer, ingredientsList: string[], aiConfig: AIConfig): Promise<{ content: string; providerUsed: string }> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import('pdf-parse') as any
        const pdfParse = pdfParseModule.default || pdfParseModule
        const data = await pdfParse(buffer)
        const text = data.text

        if (!text || text.trim().length < 10) {
            throw new Error('PDF sem texto legível. Tente enviar uma imagem ou foto do documento.')
        }

        const prompt = buildPrompt(ingredientsList) + '\n\nReceita:\n' + text
        return await processWithFallback(prompt, undefined, aiConfig)
    } catch (error) {
        if (error instanceof Error && error.message.includes('PDF sem texto')) {
            throw error
        }
        throw new Error('Não foi possível ler o PDF. Tente enviar uma imagem.')
    }
}

// Process with fallback
async function processWithFallback(prompt: string, imageBase64: string | undefined, aiConfig: AIConfig): Promise<{ content: string; providerUsed: string }> {
    let providerUsed = aiConfig.currentProvider

    try {
        if (aiConfig.currentProvider === 'gemini-2.0-flash') {
            const content = await callGemini(prompt, imageBase64)
            return { content, providerUsed }
        } else {
            const content = await callOpenAI(prompt, imageBase64)
            return { content, providerUsed }
        }
    } catch (primaryError) {
        console.error('❌ [Extract Recipe] Erro no provider principal:', primaryError)

        if (aiConfig.fallbackEnabled) {
            console.log('🔄 [Extract Recipe] Tentando fallback...')
            providerUsed = aiConfig.fallbackProvider

            try {
                if (aiConfig.fallbackProvider === 'gemini-2.0-flash') {
                    const content = await callGemini(prompt, imageBase64)
                    return { content, providerUsed }
                } else {
                    const content = await callOpenAI(prompt, imageBase64)
                    return { content, providerUsed }
                }
            } catch (fallbackError) {
                console.error('❌ [Extract Recipe] Erro no fallback:', fallbackError)
                throw fallbackError
            }
        } else {
            throw primaryError
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || ''

        let ingredientsList: string[] = []
        let imageBase64: string | undefined
        let textContent: string | undefined
        let userId: string | undefined

        // Get AI config
        const aiConfig = await getAIConfig()
        console.log('📊 [Extract Recipe] Config:', aiConfig.currentProvider, '| Fallback:', aiConfig.fallbackEnabled ? aiConfig.fallbackProvider : 'desabilitado')

        // Handle JSON body (text input)
        if (contentType.includes('application/json')) {
            const body = await request.json()
            const { text, ingredients: existingIngredients, user_id } = body

            if (!text || typeof text !== 'string' || text.trim().length < 5) {
                return NextResponse.json({ error: 'Texto muito curto ou vazio' }, { status: 400 })
            }

            ingredientsList = parseExistingIngredients(existingIngredients ? JSON.stringify(existingIngredients) : null)
            textContent = text.trim()
            userId = user_id
        }
        // Handle FormData (file upload - images/PDFs)
        else {
            const formData = await request.formData()
            const file = formData.get('file') as File | null
            const existingIngredients = formData.get('ingredients') as string | null
            userId = formData.get('user_id') as string | null || undefined

            if (!file) {
                return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
            }

            ingredientsList = parseExistingIngredients(existingIngredients)

            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const mimeType = file.type || 'image/jpeg'

            // Check if it's a PDF
            if (mimeType === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
                const result = await processPdfInput(buffer, ingredientsList, aiConfig)
                const extracted = extractJsonFromResponse(result.content)

                if (!extracted) {
                    return NextResponse.json({ error: 'Não foi possível extrair os ingredientes', raw: result.content }, { status: 422 })
                }

                const markedResult = markExistingIngredients(extracted as { ingredients?: { name: string; quantity: number; unit: string }[] }, ingredientsList)
                return NextResponse.json({ ...markedResult, provider_used: result.providerUsed })
            }

            // It's an image
            imageBase64 = buffer.toString('base64')
        }

        // Build prompt
        const prompt = textContent
            ? buildPrompt(ingredientsList) + '\n\nReceita:\n' + textContent
            : buildPrompt(ingredientsList)

        // Process with selected AI
        console.log('🤖 [Extract Recipe] Usando IA:', aiConfig.currentProvider === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' : 'GPT-5 nano')

        const result = await processWithFallback(prompt, imageBase64, aiConfig)

        console.log('✅ [Extract Recipe] Processado com:', result.providerUsed)
        console.log('📄 [Extract Recipe] Resposta:', result.content.substring(0, 200) + '...')

        // Extract JSON from response
        const extracted = extractJsonFromResponse(result.content)
        if (!extracted) {
            return NextResponse.json({
                error: 'Não foi possível extrair os ingredientes',
                raw: result.content
            }, { status: 422 })
        }

        // Mark which ingredients already exist
        const markedResult = markExistingIngredients(extracted as { ingredients?: { name: string; quantity: number; unit: string }[] }, ingredientsList)

        // Incrementar contador de scans se tiver userId
        if (userId) {
            await incrementScanCount(userId)
        }

        return NextResponse.json({
            ...markedResult,
            provider_used: result.providerUsed
        })

    } catch (error) {
        console.error('❌ [Extract Recipe] Erro:', error)
        const message = error instanceof Error ? error.message : 'Erro ao processar a receita'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
