import OpenAI from 'openai'

// Cliente OpenAI configurado para GPT-5 nano
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// Modelo mais econômico da OpenAI para Vision
export const AI_MODEL = 'gpt-5-nano'

// Limite mensal de scans por usuário
export const MONTHLY_SCAN_LIMIT = 50
