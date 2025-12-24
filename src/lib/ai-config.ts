/**
 * Configuração centralizada de IA
 * Permite alternar entre GPT-5 nano e Gemini 2.0 Flash
 */

export type AIProvider = 'gpt5-nano' | 'gemini-2.0-flash'

export interface AIConfig {
    currentProvider: AIProvider
    fallbackEnabled: boolean
    fallbackProvider: AIProvider
}

// Configuração padrão - pode ser alterada via API admin
export const DEFAULT_AI_CONFIG: AIConfig = {
    currentProvider: 'gpt5-nano',      // GPT-5 nano é mais barato
    fallbackEnabled: true,              // Habilita fallback automático
    fallbackProvider: 'gemini-2.0-flash'
}

// Custos estimados por 1M tokens (para cálculo de custos)
export const AI_COSTS = {
    'gpt5-nano': {
        input: 0.05,   // $0.05 por 1M tokens
        output: 0.40   // $0.40 por 1M tokens
    },
    'gemini-2.0-flash': {
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
