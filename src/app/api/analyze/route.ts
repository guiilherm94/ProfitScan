import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const SYSTEM_PROMPT = `Você é um consultor financeiro especialista em micro e pequenos negócios brasileiros, especialmente MEIs.

SUAS TAREFAS:
1. IDENTIFICAR O NICHO: Baseado no nome do produto, identifique o setor (alimentação, moda, artesanato, serviços, etc.)
2. MARGEM IDEAL DO SETOR: Informe qual a margem de lucro saudável para aquele nicho específico (ex: alimentação 25-35%, moda 50-100%, artesanato 40-60%)
3. DIAGNÓSTICO: Compare a margem do usuário com a margem ideal do setor
4. AÇÃO CONCRETA: Dê UMA ação específica e prática que ele pode fazer HOJE

FORMATO DA RESPOSTA (use emojis para visual):
📊 **Nicho:** [identificar setor]
📈 **Margem ideal do setor:** [X-Y%]
[Se prejuízo: 🚨 ALERTA / Se abaixo do ideal: ⚠️ ATENÇÃO / Se bom: ✅ SAUDÁVEL]
💡 **Ação:** [conselho específico e acionável]

REGRAS:
- Seja direto mas empático
- Máximo 4-5 linhas
- Se for prejuízo, seja firme mas construtivo
- Inclua números específicos quando possível (ex: "aumente R$2 no preço" ou "margem deveria ser pelo menos 30%")
- Considere que o usuário é MEI com recursos limitados`

export async function POST(request: NextRequest) {
    try {
        // Check for required environment variables
        const openaiKey = process.env.OPENAI_API_KEY
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!openaiKey) {
            return NextResponse.json(
                { error: 'OPENAI_API_KEY não configurada' },
                { status: 500 }
            )
        }

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { error: 'Supabase não configurado' },
                { status: 500 }
            )
        }

        const openai = new OpenAI({ apiKey: openaiKey })
        const supabase = createClient(supabaseUrl, supabaseKey)

        const body = await request.json()
        const { produto, custoProducao, precoVenda, custosFixos, margem, lucro, isPrejuizo } = body

        // Validate input
        if (!produto || precoVenda <= 0) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
        }

        // Prepare user message for AI with more context
        const margemIdealSugestao = margem < 0 ? 'PREJUÍZO GRAVE' : margem < 15 ? 'MUITO BAIXA' : margem < 25 ? 'ABAIXO DO IDEAL' : margem < 40 ? 'ACEITÁVEL' : 'BOA'

        const userMessage = `
Produto: ${produto}
Custo de Produção: R$ ${custoProducao.toFixed(2)}
Preço de Venda: R$ ${precoVenda.toFixed(2)}
Custos Fixos/Impostos: ${custosFixos}%
Lucro Líquido por unidade: R$ ${lucro.toFixed(2)}
Margem de Lucro Atual: ${margem.toFixed(1)}%
Avaliação Prévia: ${margemIdealSugestao}
Situação: ${isPrejuizo ? 'PREJUÍZO - URGENTE!' : 'OPERANDO COM LUCRO'}

Analise este produto e me dê sua consultoria especializada.`

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 300,
            temperature: 0.7
        })


        const aiAnalysis = completion.choices[0]?.message?.content || 'Erro ao gerar análise.'

        // Get auth header for user identification
        const authHeader = request.headers.get('cookie')

        // Try to save to history if we have auth
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                await supabase.from('history').insert({
                    user_id: session.user.id,
                    produto,
                    custo_producao: custoProducao,
                    preco_venda: precoVenda,
                    custos_fixos: custosFixos,
                    margem,
                    resposta_ia: aiAnalysis
                })
            }
        } catch (historyError) {
            // Don't fail if history save fails
            console.error('Failed to save history:', historyError)
        }

        return NextResponse.json({ analysis: aiAnalysis })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: 'Erro ao processar análise' },
            { status: 500 }
        )
    }
}

// Force dynamic rendering (prevents build-time errors)
export const dynamic = 'force-dynamic'
