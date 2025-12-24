import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { openai, AI_MODEL, MONTHLY_SCAN_LIMIT } from '@/lib/openai'
import { compressImageServer } from '@/lib/image-compressor'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const { user_id, image, prompt_type } = await request.json()

        if (!user_id || !image) {
            return NextResponse.json(
                { error: 'user_id e image são obrigatórios' },
                { status: 400 }
            )
        }

        // Verificar acesso e limite de scans
        const { data: access, error: accessError } = await supabaseAdmin
            .from('ps360_access')
            .select('*')
            .eq('user_id', user_id)
            .eq('is_active', true)
            .single()

        if (accessError || !access) {
            return NextResponse.json(
                { error: 'Acesso não encontrado ou inativo' },
                { status: 403 }
            )
        }

        // Verificar se precisa resetar o contador (passou 30 dias)
        const resetDate = new Date(access.ai_scans_reset_at || access.created_at)
        const now = new Date()
        const daysSinceReset = Math.floor((now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceReset >= 30) {
            // Resetar contador
            await supabaseAdmin
                .from('ps360_access')
                .update({
                    ai_scans_used: 0,
                    ai_scans_reset_at: now.toISOString()
                })
                .eq('user_id', user_id)

            access.ai_scans_used = 0
        }

        // Verificar limite
        const scansUsed = access.ai_scans_used || 0
        if (scansUsed >= MONTHLY_SCAN_LIMIT) {
            return NextResponse.json({
                error: 'Limite de scans atingido',
                limit_reached: true,
                scans_used: scansUsed,
                scans_limit: MONTHLY_SCAN_LIMIT,
                upsell_message: 'Deseja comprar um pacote extra de 50 digitalizações por R$ 14,90?'
            }, { status: 429 })
        }

        // Comprimir imagem antes de enviar (economia de tokens)
        const compressedImage = await compressImageServer(image)

        // Definir prompt baseado no tipo
        let systemPrompt = ''
        switch (prompt_type) {
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

        // Chamar GPT-5 nano Vision
        const response = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: compressedImage.startsWith('data:')
                                    ? compressedImage
                                    : `data:image/jpeg;base64,${compressedImage}`,
                                detail: 'low' // Usar low detail para economizar tokens
                            }
                        }
                    ]
                }
            ],
            max_tokens: 2000,
            temperature: 0.1 // Baixa temperatura para respostas mais precisas
        })

        const result = response.choices[0]?.message?.content || ''

        // Incrementar contador de scans
        await supabaseAdmin
            .from('ps360_access')
            .update({
                ai_scans_used: scansUsed + 1
            })
            .eq('user_id', user_id)

        // Tentar parsear resultado como JSON
        let parsedResult
        try {
            // Remover markdown code blocks se existirem
            const cleanResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            parsedResult = JSON.parse(cleanResult)
        } catch {
            parsedResult = { raw_text: result }
        }

        return NextResponse.json({
            success: true,
            data: parsedResult,
            scans_remaining: MONTHLY_SCAN_LIMIT - (scansUsed + 1),
            scans_used: scansUsed + 1,
            scans_limit: MONTHLY_SCAN_LIMIT
        })

    } catch (error) {
        console.error('Erro no scan de imagem:', error)
        return NextResponse.json(
            { error: 'Erro interno ao processar imagem' },
            { status: 500 }
        )
    }
}
