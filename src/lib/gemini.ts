import { GoogleGenAI } from '@google/genai'

// Cliente Gemini usando novo SDK unificado (Dezembro 2025)
export const gemini = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY!
})

// Modelo Gemini 2.0 Flash - bom custo-benefício para Vision
export const GEMINI_MODEL = 'gemini-2.0-flash'

/**
 * Processa imagem com Gemini 2.0 Flash
 */
export async function processImageWithGemini(
    imageBase64: string,
    promptType: 'cardapio' | 'receita' | 'nota_fiscal' | 'geral'
): Promise<string> {
    // Definir prompt baseado no tipo
    let systemPrompt = ''
    switch (promptType) {
        case 'cardapio':
            systemPrompt = `Você é um especialista em análise de cardápios de restaurantes. 
                Extraia todos os itens do cardápio com seus nomes e preços.
                Retorne em formato JSON: { "itens": [{ "nome": "...", "preco": 0.00 }] }`
            break
        case 'receita':
            systemPrompt = `Você é um especialista em análise de receitas culinárias.
                Extraia todos os ingredientes com suas quantidades e unidades.
                Retorne em formato JSON: { "ingredientes": [{ "nome": "...", "quantidade": 0, "unidade": "..." }] }`
            break
        case 'nota_fiscal':
            systemPrompt = `Você é um especialista em análise de notas fiscais.
                Extraia os itens comprados com nomes, quantidades e valores.
                Retorne em formato JSON: { "itens": [{ "nome": "...", "quantidade": 0, "valor_unitario": 0.00, "valor_total": 0.00 }], "total": 0.00 }`
            break
        default:
            systemPrompt = `Analise a imagem e extraia todas as informações relevantes.
                Retorne em formato JSON estruturado.`
    }

    // Preparar imagem para o Gemini
    const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // Chamar Gemini 2.0 Flash
    const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
            {
                role: 'user',
                parts: [
                    { text: systemPrompt },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: imageData
                        }
                    }
                ]
            }
        ],
        config: {
            maxOutputTokens: 2000,
            temperature: 0.1
        }
    })

    return response.text || ''
}
