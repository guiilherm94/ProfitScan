import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const gemini = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' })

interface AIConfig {
    currentProvider: string
    fallbackEnabled: boolean
    fallbackProvider: string
}

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

// Get AI configuration from database
async function getAIConfig(): Promise<AIConfig> {
    try {
        const { data } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'ai_config')
            .single()

        return data?.value || {
            currentProvider: 'gemini-2.0-flash-lite',
            fallbackEnabled: true,
            fallbackProvider: 'gpt5-nano'
        }
    } catch {
        return {
            currentProvider: 'gemini-2.0-flash-lite',
            fallbackEnabled: true,
            fallbackProvider: 'gpt5-nano'
        }
    }
}

// Call OpenAI GPT-5 nano
async function callOpenAI(prompt: string): Promise<string> {
    console.log('🤖 [Analyze] Usando GPT-5 nano')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai.responses as any).create({
        model: 'gpt-5-nano',
        input: [
            { type: 'message', role: 'developer', content: [{ type: 'input_text', text: SYSTEM_PROMPT }] },
            { type: 'message', role: 'user', content: [{ type: 'input_text', text: prompt }] }
        ],
        reasoning: { effort: 'minimal' },
        text: { verbosity: 'low' },
        max_output_tokens: 500
    })

    return response.output_text || ''
}

// Call Gemini model
async function callGeminiModel(prompt: string, modelId: string): Promise<string> {
    console.log(`🤖 [Analyze] Usando ${modelId}`)

    const response = await gemini.models.generateContent({
        model: modelId,
        contents: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }]
    })

    return response.text || ''
}

// Map provider names to Gemini model IDs
const GEMINI_MODEL_IDS: Record<string, string> = {
    'gemini-2.0-flash': 'gemini-2.0-flash',
    'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite'
}

// Call the appropriate AI model
async function callAIModel(provider: string, prompt: string): Promise<string> {
    if (provider === 'gpt5-nano') {
        return await callOpenAI(prompt)
    } else if (GEMINI_MODEL_IDS[provider]) {
        return await callGeminiModel(prompt, GEMINI_MODEL_IDS[provider])
    } else {
        console.warn(`⚠️ Unknown provider: ${provider}, defaulting to gpt5-nano`)
        return await callOpenAI(prompt)
    }
}

// Process with fallback
async function processWithFallback(prompt: string, aiConfig: AIConfig): Promise<{ content: string; providerUsed: string }> {
    let providerUsed = aiConfig.currentProvider

    try {
        const content = await callAIModel(aiConfig.currentProvider, prompt)
        return { content, providerUsed }
    } catch (primaryError) {
        console.error('❌ [Analyze] Erro no provider principal:', primaryError)

        if (aiConfig.fallbackEnabled && aiConfig.fallbackProvider) {
            console.log(`🔄 [Analyze] Tentando fallback: ${aiConfig.fallbackProvider}`)
            providerUsed = aiConfig.fallbackProvider

            try {
                const content = await callAIModel(aiConfig.fallbackProvider, prompt)
                return { content, providerUsed }
            } catch (fallbackError) {
                console.error('❌ [Analyze] Erro no fallback:', fallbackError)
                throw fallbackError
            }
        } else {
            throw primaryError
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { produto, custoProducao, precoVenda, custosFixos, margem, lucro, isPrejuizo, status, statusMessage } = body

        // Validate input
        if (!produto || precoVenda <= 0) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
        }

        // Get AI configuration
        const aiConfig = await getAIConfig()
        console.log('📊 [Analyze] Provider:', aiConfig.currentProvider)

        // Prepare user message for AI with more context
        const margemIdealSugestao = margem < 0 ? 'PREJUÍZO GRAVE' : margem < 15 ? 'MUITO BAIXA' : margem < 25 ? 'ABAIXO DO IDEAL' : margem < 40 ? 'ACEITÁVEL' : 'BOA'

        const userMessage = `
Produto: ${produto}
Custo de Produção: R$ ${custoProducao.toFixed(2)}
Preço de Venda: R$ ${precoVenda.toFixed(2)}
Custos Fixos/Impostos: ${custosFixos}%
Lucro Líquido por unidade: R$ ${lucro.toFixed(2)}
Margem de Lucro Atual: ${margem.toFixed(1)}%
Avaliação do Sistema: ${status?.toUpperCase() || margemIdealSugestao} - ${statusMessage || 'Sem mensagem'}
Situação: ${isPrejuizo ? 'PREJUÍZO - URGENTE!' : margem < 15 ? 'MARGEM BAIXA - ATENÇÃO' : 'OPERANDO COM LUCRO'}

Analise este produto e me dê sua consultoria especializada.`

        // Process with AI
        const result = await processWithFallback(userMessage, aiConfig)
        console.log('✅ [Analyze] Processado com:', result.providerUsed)

        // Save to history if possible
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                const userId = session.user.id

                await supabase.from('history').insert({
                    user_id: userId,
                    produto,
                    custo_producao: custoProducao,
                    preco_venda: precoVenda,
                    custos_fixos: custosFixos,
                    margem,
                    resposta_ia: result.content
                })

                // Limit to 100 entries per user
                const { count } = await supabase
                    .from('history')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)

                if (count && count > 100) {
                    const entriesToDelete = count - 100
                    const { data: oldestEntries } = await supabase
                        .from('history')
                        .select('id')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: true })
                        .limit(entriesToDelete)

                    if (oldestEntries && oldestEntries.length > 0) {
                        const idsToDelete = oldestEntries.map(e => e.id)
                        await supabase.from('history').delete().in('id', idsToDelete)
                    }
                }
            }
        } catch (historyError) {
            console.error('Failed to save history:', historyError)
        }

        return NextResponse.json({
            analysis: result.content,
            provider_used: result.providerUsed
        })

    } catch (error) {
        console.error('❌ [Analyze] Erro:', error)
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar análise'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
