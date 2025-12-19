import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface StoreProfile {
    store_name: string
    store_niche: string
    store_tone: string
}

interface RequestBody {
    comment: string
    stars: number
    storeProfile: StoreProfile
}

export async function POST(request: NextRequest) {
    try {
        const openaiKey = process.env.OPENAI_API_KEY

        if (!openaiKey) {
            return NextResponse.json(
                { error: 'OPENAI_API_KEY não configurada' },
                { status: 500 }
            )
        }

        const openai = new OpenAI({ apiKey: openaiKey })
        const body: RequestBody = await request.json()
        const { comment, stars, storeProfile } = body

        if (!comment || !storeProfile) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
        }

        const { store_name, store_niche, store_tone } = storeProfile

        // Determinar se é avaliação positiva ou negativa
        const isNegative = stars <= 2
        const isNeutral = stars === 3
        const isPositive = stars >= 4

        const situacao = isNegative
            ? 'RECLAMAÇÃO/AVALIAÇÃO NEGATIVA - Precisa de resposta cuidadosa para reverter a situação'
            : isNeutral
                ? 'AVALIAÇÃO MISTA - Cliente satisfeito mas com ressalvas'
                : 'AVALIAÇÃO POSITIVA - Agradecer e fidelizar'

        const systemPrompt = `ATUE COMO: Gerente de Suporte e Crise da empresa "${store_name}".
O QUE A EMPRESA VENDE: "${store_niche}".
TOM DE COMUNICAÇÃO: ${store_tone}.

CONTEXTO:
O cliente deixou a seguinte avaliação: "${comment}"
Nota: ${stars} de 5 estrelas.
Situação: ${situacao}

MISSÃO:
Gere EXATAMENTE 3 respostas personalizadas diferentes.
Use o contexto do nicho ("${store_niche}") para usar termos técnicos corretos do segmento.
${isNegative ? 'IMPORTANTE: O cliente está insatisfeito. Foque em pedir desculpas, mostrar empatia e oferecer solução.' : ''}
${isPositive ? 'IMPORTANTE: O cliente está satisfeito. Agradeça genuinamente e incentive a voltar.' : ''}

FORMATO DE RESPOSTA (JSON):
Retorne APENAS um JSON válido sem markdown, no seguinte formato:
{
  "responses": [
    {"type": "Educada e Rápida", "content": "..."},
    {"type": "Empática e Humanizada", "content": "..."},
    {"type": "Profissional e Institucional", "content": "..."}
  ]
}

REGRAS:
- Cada resposta deve ter entre 2-4 frases
- Assine no final como: Equipe ${store_name}
- NÃO use markdown no JSON
- Personalize com termos do nicho ${store_niche}`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Gere as 3 respostas para esta avaliação de ${stars} estrelas: "${comment}"` }
            ],
            max_tokens: 800,
            temperature: 0.7
        })

        const responseText = completion.choices[0]?.message?.content || ''

        // Parse do JSON
        try {
            // Limpar possível markdown
            const cleanJson = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()

            const parsed = JSON.parse(cleanJson)
            return NextResponse.json(parsed)
        } catch {
            // Se falhar o parse, criar resposta estruturada manualmente
            console.error('Erro ao parsear JSON, resposta:', responseText)
            return NextResponse.json({
                responses: [
                    { type: 'Resposta Gerada', content: responseText }
                ]
            })
        }

    } catch (error) {
        console.error('Erro na API:', error)
        return NextResponse.json(
            { error: 'Erro ao gerar respostas' },
            { status: 500 }
        )
    }
}

export const dynamic = 'force-dynamic'
