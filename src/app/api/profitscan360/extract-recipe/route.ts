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
        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'ai_config')
            .single()

        if (error) {
            console.log('⚠️ [AI Config] Erro ao buscar config:', error.message)
        }

        const config = data?.value || {
            currentProvider: 'gemini-2.0-flash-lite',
            fallbackEnabled: true,
            fallbackProvider: 'gpt5-nano'
        }

        console.log('📋 [AI Config] Config carregada:', JSON.stringify(config))
        return config
    } catch (err) {
        console.error('❌ [AI Config] Exception:', err)
        return {
            currentProvider: 'gemini-2.0-flash-lite',
            fallbackEnabled: true,
            fallbackProvider: 'gpt5-nano'
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

// Process with GPT-5 nano using Responses API
async function callOpenAI(prompt: string, imageBase64?: string): Promise<string> {
    console.log('🔍 [OpenAI Request] Sending request to GPT-5 nano via Responses API...')

    // Build input for Responses API (using any for compatibility with new API)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input: any[] = [
        {
            type: 'message',
            role: 'developer',
            content: [{ type: 'input_text', text: prompt }]
        }
    ]

    if (imageBase64) {
        const imageUrl = imageBase64.startsWith('data:')
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`

        input.push({
            type: 'message',
            role: 'user',
            content: [
                { type: 'input_image', image_url: imageUrl, detail: 'low' },
                { type: 'input_text', text: 'Extraia os ingredientes desta receita e retorne apenas o JSON.' }
            ]
        })
    } else {
        input.push({
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: 'Extraia os ingredientes da receita informada e retorne apenas o JSON.' }]
        })
    }

    // Use Responses API with GPT-5-nano optimized settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai.responses as any).create({
        model: 'gpt-5-nano',
        input,
        reasoning: { effort: 'minimal' }, // GPT-5-nano supports: minimal, low, medium, high
        text: { verbosity: 'low' },     // Concise responses
        max_output_tokens: 4000
    })

    // Extract text content from response
    const content = response.output_text || ''
    console.log('🔍 [OpenAI Response] Content length:', content.length)
    console.log('🔍 [OpenAI Response] First 500 chars:', content.substring(0, 500))

    return content
}

// Process with Gemini (supports multiple models) - using official documentation format
async function callGeminiModel(prompt: string, modelId: string, imageBase64?: string): Promise<string> {
    console.log(`🔍 [Gemini Request] Sending request to ${modelId}...`)

    // Build contents following official documentation format
    // https://ai.google.dev/gemini-api/docs/image-understanding
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = []

    if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
        contents.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
            }
        })
    }

    // Add text prompt after image
    contents.push({ text: prompt })

    try {
        const response = await gemini.models.generateContent({
            model: modelId,
            contents: contents
        })

        const content = response.text || ''
        console.log(`🔍 [Gemini Response] Model: ${modelId}, Content length: ${content.length}`)
        console.log(`🔍 [Gemini Response] First 200 chars: ${content.substring(0, 200)}`)

        return content
    } catch (error) {
        console.error(`❌ [Gemini Error] Model: ${modelId}`, error)
        throw error
    }
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

// Map provider names to Gemini model IDs (usar nomes simples como gemini-2.0-flash funciona)
const GEMINI_MODEL_IDS: Record<string, string> = {
    'gemini-2.0-flash': 'gemini-2.0-flash',
    'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite'
}

// Helper function to call the appropriate AI model
async function callAIModel(provider: string, prompt: string, imageBase64?: string): Promise<string> {
    if (provider === 'gpt5-nano') {
        return await callOpenAI(prompt, imageBase64)
    } else if (GEMINI_MODEL_IDS[provider]) {
        return await callGeminiModel(prompt, GEMINI_MODEL_IDS[provider], imageBase64)
    } else {
        // Default to GPT-5 nano if unknown provider
        console.warn(`⚠️ Unknown provider: ${provider}, defaulting to gpt5-nano`)
        return await callOpenAI(prompt, imageBase64)
    }
}

// Process with fallback
async function processWithFallback(prompt: string, imageBase64: string | undefined, aiConfig: AIConfig): Promise<{ content: string; providerUsed: string }> {
    let providerUsed = aiConfig.currentProvider

    try {
        console.log(`🚀 [Extract Recipe] Using primary provider: ${aiConfig.currentProvider}`)
        const content = await callAIModel(aiConfig.currentProvider, prompt, imageBase64)
        return { content, providerUsed }
    } catch (primaryError) {
        console.error('❌ [Extract Recipe] Erro no provider principal:', primaryError)

        if (aiConfig.fallbackEnabled && aiConfig.fallbackProvider) {
            console.log(`🔄 [Extract Recipe] Tentando fallback: ${aiConfig.fallbackProvider}`)
            providerUsed = aiConfig.fallbackProvider

            try {
                const content = await callAIModel(aiConfig.fallbackProvider, prompt, imageBase64)
                return { content, providerUsed }
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
        console.log('🤖 [Extract Recipe] Usando IA:', aiConfig.currentProvider)

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
