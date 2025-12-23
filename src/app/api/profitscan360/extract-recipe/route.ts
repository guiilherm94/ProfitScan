import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

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

// Process text input (plain text, copy-paste from Excel, etc.)
async function processTextInput(text: string, ingredientsList: string[]) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: buildPrompt(ingredientsList)
            },
            {
                role: 'user',
                content: `Extraia os ingredientes desta receita. O texto pode estar desorganizado, copiado do Excel, ou escrito manualmente:\n\n${text}`
            }
        ],
        max_tokens: 1500
    })
    return response.choices[0]?.message?.content || ''
}

// Process image input
async function processImageInput(base64: string, mimeType: string, ingredientsList: string[]) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: buildPrompt(ingredientsList)
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${base64}`
                        }
                    },
                    {
                        type: 'text',
                        text: 'Extraia os ingredientes desta receita com quantidades.'
                    }
                ]
            }
        ],
        max_tokens: 1500
    })
    return response.choices[0]?.message?.content || ''
}

// Process PDF input
async function processPdfInput(buffer: Buffer, ingredientsList: string[]) {
    try {
        // Dynamic import to avoid Turbopack/Vercel build issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import('pdf-parse') as any
        const pdfParse = pdfParseModule.default || pdfParseModule
        const data = await pdfParse(buffer)
        const text = data.text

        if (!text || text.trim().length < 10) {
            throw new Error('PDF sem texto legível. Tente enviar uma imagem ou foto do documento.')
        }

        return await processTextInput(text, ingredientsList)
    } catch (error) {
        if (error instanceof Error && error.message.includes('PDF sem texto')) {
            throw error
        }
        throw new Error('Não foi possível ler o PDF. Tente enviar uma imagem.')
    }
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || ''

        let ingredientsList: string[] = []
        let content: string

        // Handle JSON body (text input)
        if (contentType.includes('application/json')) {
            const body = await request.json()
            const { text, ingredients: existingIngredients } = body

            if (!text || typeof text !== 'string' || text.trim().length < 5) {
                return NextResponse.json({ error: 'Texto muito curto ou vazio' }, { status: 400 })
            }

            ingredientsList = parseExistingIngredients(existingIngredients ? JSON.stringify(existingIngredients) : null)
            content = await processTextInput(text.trim(), ingredientsList)
        }
        // Handle FormData (file upload - images/PDFs)
        else {
            const formData = await request.formData()
            const file = formData.get('file') as File | null
            const existingIngredients = formData.get('ingredients') as string | null

            if (!file) {
                return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
            }

            ingredientsList = parseExistingIngredients(existingIngredients)

            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const mimeType = file.type || 'image/jpeg'

            // Check if it's a PDF
            if (mimeType === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
                content = await processPdfInput(buffer, ingredientsList)
            }
            // Treat as image
            else {
                const base64 = buffer.toString('base64')
                content = await processImageInput(base64, mimeType, ingredientsList)
            }
        }

        // Extract JSON from response
        const extracted = extractJsonFromResponse(content)
        if (!extracted) {
            return NextResponse.json({
                error: 'Não foi possível extrair os ingredientes',
                raw: content
            }, { status: 422 })
        }

        // Mark which ingredients already exist
        const result = markExistingIngredients(extracted as { ingredients?: { name: string; quantity: number; unit: string }[] }, ingredientsList)

        return NextResponse.json(result)

    } catch (error) {
        console.error('Erro ao extrair receita:', error)
        const message = error instanceof Error ? error.message : 'Erro ao processar a receita'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
