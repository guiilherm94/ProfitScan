import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

interface Product {
    id: string
    name: string
    sale_price: number
    avg_monthly_revenue: number
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { products, totalRevenue } = body as {
            products: Product[]
            totalRevenue: number
        }

        if (!products || products.length === 0 || !totalRevenue) {
            return NextResponse.json({
                error: 'Informe os produtos e o faturamento total'
            }, { status: 400 })
        }

        const productList = products.map(p => `- ${p.name} (preço: R$ ${p.sale_price})`).join('\n')

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Você é um analista de dados financeiros especializado em food service.
Sua tarefa é distribuir o faturamento total mensal entre os produtos de forma REALISTA.

Considere:
- Produtos mais baratos geralmente vendem mais unidades
- Produtos mais caros têm menos volume
- A soma das receitas deve ser EXATAMENTE igual ao faturamento total

Retorne APENAS um JSON no formato:
{
  "allocations": [
    { "id": "uuid-do-produto", "name": "Nome", "revenue": 1500.00, "reasoning": "Motivo curto" }
  ],
  "analysis": "Breve análise geral da distribuição"
}`
                },
                {
                    role: 'user',
                    content: `Faturamento total mensal: R$ ${totalRevenue.toFixed(2)}

Produtos do cardápio:
${productList}

Distribua o faturamento de forma proporcional e realista. IDs dos produtos:
${products.map(p => `${p.name}: ${p.id}`).join('\n')}`
                }
            ],
            max_tokens: 1500
        })

        const content = response.choices[0]?.message?.content || ''

        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({
                error: 'Não foi possível processar a distribuição',
                raw: content
            }, { status: 422 })
        }

        const result = JSON.parse(jsonMatch[0])
        return NextResponse.json(result)

    } catch (error) {
        console.error('Erro ao ratear faturamento:', error)
        return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
