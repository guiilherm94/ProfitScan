import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AIProvider, DEFAULT_AI_CONFIG, AI_COSTS } from '@/lib/ai-config'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tabela para armazenar configurações do sistema
const SETTINGS_TABLE = 'system_settings'
const AI_SETTINGS_KEY = 'ai_config'

// GET - Buscar configuração atual
export async function GET() {
    try {
        const { data: settings } = await supabaseAdmin
            .from(SETTINGS_TABLE)
            .select('value')
            .eq('key', AI_SETTINGS_KEY)
            .single()

        const config = settings?.value || DEFAULT_AI_CONFIG

        return NextResponse.json({
            currentProvider: config.currentProvider,
            fallbackEnabled: config.fallbackEnabled,
            fallbackProvider: config.fallbackProvider,
            availableProviders: [
                {
                    id: 'gemini-2.0-flash-lite',
                    name: 'Gemini 2.0 Flash-Lite',
                    inputCost: AI_COSTS['gemini-2.0-flash-lite'].input,
                    outputCost: AI_COSTS['gemini-2.0-flash-lite'].output,
                    description: '🏆 MAIS BARATO - Custo mínimo, alta velocidade'
                },
                {
                    id: 'gpt5-nano',
                    name: 'GPT-5 nano (OpenAI)',
                    inputCost: AI_COSTS['gpt5-nano'].input,
                    outputCost: AI_COSTS['gpt5-nano'].output,
                    description: 'Boa precisão, tarefas simples'
                },
                {
                    id: 'gemini-2.5-flash-lite',
                    name: 'Gemini 2.5 Flash-Lite',
                    inputCost: AI_COSTS['gemini-2.5-flash-lite'].input,
                    outputCost: AI_COSTS['gemini-2.5-flash-lite'].output,
                    description: 'Mais recente, otimizado para reasoning'
                },
                {
                    id: 'gemini-2.0-flash',
                    name: 'Gemini 2.0 Flash',
                    inputCost: AI_COSTS['gemini-2.0-flash'].input,
                    outputCost: AI_COSTS['gemini-2.0-flash'].output,
                    description: 'Maior precisão, melhor para imagens complexas'
                }
            ]
        })

    } catch (error) {
        console.error('Erro ao buscar configurações:', error)
        // Se tabela não existe, retornar config padrão
        return NextResponse.json({
            ...DEFAULT_AI_CONFIG,
            availableProviders: [
                {
                    id: 'gemini-2.0-flash-lite',
                    name: 'Gemini 2.0 Flash-Lite',
                    inputCost: AI_COSTS['gemini-2.0-flash-lite'].input,
                    outputCost: AI_COSTS['gemini-2.0-flash-lite'].output
                },
                {
                    id: 'gpt5-nano',
                    name: 'GPT-5 nano (OpenAI)',
                    inputCost: AI_COSTS['gpt5-nano'].input,
                    outputCost: AI_COSTS['gpt5-nano'].output
                },
                {
                    id: 'gemini-2.5-flash-lite',
                    name: 'Gemini 2.5 Flash-Lite',
                    inputCost: AI_COSTS['gemini-2.5-flash-lite'].input,
                    outputCost: AI_COSTS['gemini-2.5-flash-lite'].output
                },
                {
                    id: 'gemini-2.0-flash',
                    name: 'Gemini 2.0 Flash',
                    inputCost: AI_COSTS['gemini-2.0-flash'].input,
                    outputCost: AI_COSTS['gemini-2.0-flash'].output
                }
            ]
        })
    }
}

// PUT - Atualizar configuração
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { currentProvider, fallbackEnabled, fallbackProvider } = body

        // Validar provider se foi passado
        const validProviders: AIProvider[] = ['gpt5-nano', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash-lite']
        if (currentProvider && !validProviders.includes(currentProvider)) {
            return NextResponse.json(
                { error: 'Provider inválido' },
                { status: 400 }
            )
        }

        // Buscar configuração atual para fazer merge
        let existingConfig = DEFAULT_AI_CONFIG
        try {
            const { data: settings } = await supabaseAdmin
                .from(SETTINGS_TABLE)
                .select('value')
                .eq('key', AI_SETTINGS_KEY)
                .single()

            if (settings?.value) {
                existingConfig = settings.value
            }
        } catch {
            // Config não existe, usar default
        }

        // Fazer merge: só atualiza o que foi passado
        const newConfig = {
            currentProvider: currentProvider !== undefined ? currentProvider : existingConfig.currentProvider,
            fallbackEnabled: fallbackEnabled !== undefined ? fallbackEnabled : existingConfig.fallbackEnabled,
            fallbackProvider: fallbackProvider !== undefined ? fallbackProvider : existingConfig.fallbackProvider
        }

        // Salvar na tabela de configurações
        try {
            await supabaseAdmin
                .from(SETTINGS_TABLE)
                .upsert({
                    key: AI_SETTINGS_KEY,
                    value: newConfig,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' })
        } catch {
            console.log('Tabela system_settings pode não existir.')
        }

        return NextResponse.json({
            success: true,
            config: newConfig,
            message: `Configuração atualizada`
        })

    } catch (error) {
        console.error('Erro ao atualizar configurações:', error)
        return NextResponse.json(
            { error: 'Erro interno' },
            { status: 500 }
        )
    }
}
