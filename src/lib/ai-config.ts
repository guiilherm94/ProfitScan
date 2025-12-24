/**
 * Configuração centralizada de IA
 * Permite alternar entre GPT-5 nano e modelos Gemini
 */

export type AIProvider =
    | 'gpt5-nano'
    | 'gemini-2.0-flash'
    | 'gemini-2.0-flash-lite'
    | 'gemini-2.5-flash-lite'

export interface AIConfig {
    currentProvider: AIProvider
    fallbackEnabled: boolean
    fallbackProvider: AIProvider
}

// Configuração padrão - pode ser alterada via API admin
export const DEFAULT_AI_CONFIG: AIConfig = {
    currentProvider: 'gemini-2.0-flash-lite',  // Mais barato de todos
    fallbackEnabled: true,                      // Habilita fallback automático
    fallbackProvider: 'gpt5-nano'
}

// Custos estimados por 1M tokens (preços oficiais de dezembro 2024)
export const AI_COSTS: Record<AIProvider, { input: number; output: number }> = {
    'gpt5-nano': {
        input: 0.05,   // $0.05 por 1M tokens
        output: 0.40   // $0.40 por 1M tokens
    },
    'gemini-2.0-flash': {
        input: 0.15,   // $0.15 por 1M tokens
        output: 0.60   // $0.60 por 1M tokens
    },
    'gemini-2.0-flash-lite': {
        input: 0.075,  // $0.075 por 1M tokens (mais barato!)
        output: 0.03   // $0.03 por 1M tokens (mais barato!)
    },
    'gemini-2.5-flash-lite': {
        input: 0.10,   // $0.10 por 1M tokens
        output: 0.40   // $0.40 por 1M tokens
    }
}

// Tokens estimados por scan de imagem (média)
export const ESTIMATED_TOKENS_PER_SCAN = {
    input: 1500,   // ~1500 tokens de input (imagem + prompt)
    output: 500    // ~500 tokens de output (resposta JSON)
}

/**
 * Calcula o custo estimado de um scan
 */
export function calculateScanCost(provider: AIProvider): number {
    const costs = AI_COSTS[provider]
    const tokens = ESTIMATED_TOKENS_PER_SCAN

    const inputCost = (tokens.input / 1_000_000) * costs.input
    const outputCost = (tokens.output / 1_000_000) * costs.output

    return inputCost + outputCost
}
