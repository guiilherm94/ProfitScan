import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

// Initialize clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const gemini = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AIConfig {
    currentProvider: string
    fallbackEnabled: boolean
    fallbackProvider: string
}

interface Product {
    id: string
    name: string
    sale_price: number
    avg_monthly_revenue: number
}

// Get AI configuration from database
async function getAIConfig(): Promise<AIConfig> {
    try {
        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'ai_config')
            .single()

        if (error) {
            console.log('⚠️ [AI Revenue] Erro ao buscar config:', error.message)
        }

        const config = data?.value || {
            currentProvider: 'gemini-2.0-flash-lite',
            fallbackEnabled: true,
            fallbackProvider: 'gpt5-nano'
        }

        console.log('📋 [AI Revenue] Config:', JSON.stringify(config))
        return config
    } catch {
        return {
            currentProvider: 'gemini-2.0-flash-lite',
            fallbackEnabled: true,
            fallbackProvider: 'gpt5-nano'
        }
    }
}

// Build the prompt for revenue allocation
function buildPrompt(products: Product[], totalRevenue: number): string {
    const productList = products.map(p => `- ${p.name} (preço: R$ ${p.sale_price})`).join('\n')
    const productIds = products.map(p => `${p.name}: ${p.id}`).join('\n')

    return `Você é um analista de dados financeiros especializado em food service.
Sua tarefa é distribuir o faturamento total mensal entre os produtos de forma REALISTA.

Considere:
- Produtos mais baratos geralmente vendem mais unidades
- Produtos mais caros têm menos volume
- A soma das receitas deve ser EXATAMENTE igual ao faturamento total: R$ ${totalRevenue.toFixed(2)}

Faturamento total mensal: R$ ${totalRevenue.toFixed(2)}

Produtos do cardápio:
${productList}

IDs dos produtos:
${productIds}

Retorne APENAS um JSON válido no formato (sem markdown, sem texto antes ou depois):
{
  "allocations": [
    { "id": "uuid-do-produto", "name": "Nome", "revenue": 1500.00, "reasoning": "Motivo curto" }
  ],
  "analysis": "Breve análise geral da distribuição"
}`
}

// Call OpenAI GPT-5 nano
async function callOpenAI(prompt: string): Promise<string> {
    console.log('🔍 [AI Revenue] Calling gpt5-nano...')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai.responses as any).create({
        model: 'gpt-5-nano',
        input: [
            { type: 'message', role: 'user', content: [{ type: 'input_text', text: prompt }] }
        ],
        reasoning: { effort: 'minimal' },
        text: { verbosity: 'low' },
        max_output_tokens: 2000
    })

    const content = response.output_text || ''
    console.log('🔍 [AI Revenue] GPT-5 response length:', content.length)
    return content
}

// Call Gemini model
async function callGeminiModel(prompt: string, modelId: string): Promise<string> {
    console.log(`🔍 [AI Revenue] Calling ${modelId}...`)

    const response = await gemini.models.generateContent({
        model: modelId,
        contents: [{ text: prompt }]
    })

    const content = response.text || ''
    console.log(`🔍 [AI Revenue] ${modelId} response length:`, content.length)
    return content
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
        console.log(`🚀 [AI Revenue] Using primary provider: ${aiConfig.currentProvider}`)
        const content = await callAIModel(aiConfig.currentProvider, prompt)
        return { content, providerUsed }
    } catch (primaryError) {
        console.error('❌ [AI Revenue] Erro no provider principal:', primaryError)

        if (aiConfig.fallbackEnabled && aiConfig.fallbackProvider) {
            console.log(`🔄 [AI Revenue] Tentando fallback: ${aiConfig.fallbackProvider}`)
            providerUsed = aiConfig.fallbackProvider

            try {
                const content = await callAIModel(aiConfig.fallbackProvider, prompt)
                return { content, providerUsed }
            } catch (fallbackError) {
                console.error('❌ [AI Revenue] Erro no fallback:', fallbackError)
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
        const { products, totalRevenue } = body as {
            products: Product[]
            totalRevenue: number
        }

        if (!products || products.length === 0 || !totalRevenue) {
            return NextResponse.json({
                error: 'Informe os produtos e o faturamento total'
            }, { status: 400 })
        }

        // Get AI configuration
        const aiConfig = await getAIConfig()

        // Build prompt and call AI
        const prompt = buildPrompt(products, totalRevenue)
        console.log('🤖 [AI Revenue] Usando IA:', aiConfig.currentProvider)

        const result = await processWithFallback(prompt, aiConfig)
        console.log('✅ [AI Revenue] Processado com:', result.providerUsed)

        // Extract JSON from response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({
                error: 'Não foi possível processar a distribuição',
                raw: result.content,
                provider_used: result.providerUsed
            }, { status: 422 })
        }

        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({
            ...parsed,
            provider_used: result.providerUsed
        })

    } catch (error) {
        console.error('❌ [AI Revenue] Erro:', error)
        return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
