import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const existingIngredients = formData.get('ingredients') as string | null

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')

        // Determine mime type
        const mimeType = file.type || 'image/jpeg'

        // Parse existing ingredients for matching
        let ingredientsList: string[] = []
        if (existingIngredients) {
            try {
                const parsed = JSON.parse(existingIngredients)
                ingredientsList = parsed.map((i: { name: string }) => i.name.toLowerCase())
            } catch (e) {
                // ignore
            }
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Você é um especialista em extrair ingredientes de receitas.
Analise a imagem/documento e extraia TODOS os ingredientes com suas quantidades.

Retorne APENAS um JSON no formato:
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
${ingredientsList.length > 0 ? ingredientsList.join(', ') : 'Nenhum cadastrado ainda'}

Se um ingrediente NÃO existir na lista acima, inclua-o mesmo assim.
Seja preciso nas quantidades e unidades.`
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

        const content = response.choices[0]?.message?.content || ''

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({
                error: 'Não foi possível extrair os ingredientes',
                raw: content
            }, { status: 422 })
        }

        const extracted = JSON.parse(jsonMatch[0])

        // Mark which ingredients already exist
        if (extracted.ingredients && Array.isArray(extracted.ingredients)) {
            extracted.ingredients = extracted.ingredients.map((ing: { name: string; quantity: number; unit: string }) => ({
                ...ing,
                exists: ingredientsList.includes(ing.name.toLowerCase())
            }))
        }

        return NextResponse.json(extracted)

    } catch (error) {
        console.error('Erro ao extrair receita:', error)
        return NextResponse.json({ error: 'Erro ao processar a imagem' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
