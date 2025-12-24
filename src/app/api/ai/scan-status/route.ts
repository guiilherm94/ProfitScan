import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MONTHLY_SCAN_LIMIT } from '@/lib/openai'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id é obrigatório' },
                { status: 400 }
            )
        }

        // Buscar dados de acesso
        const { data: access, error } = await supabaseAdmin
            .from('ps360_access')
            .select('ai_scans_used, ai_scans_reset_at, created_at')
            .eq('user_id', userId)
            .single()

        if (error || !access) {
            return NextResponse.json(
                { error: 'Acesso não encontrado' },
                { status: 404 }
            )
        }

        // Verificar se precisa resetar (passou 30 dias)
        const resetDate = new Date(access.ai_scans_reset_at || access.created_at)
        const now = new Date()
        const daysSinceReset = Math.floor((now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24))

        let scansUsed = access.ai_scans_used || 0

        if (daysSinceReset >= 30) {
            // Resetar contador
            await supabaseAdmin
                .from('ps360_access')
                .update({
                    ai_scans_used: 0,
                    ai_scans_reset_at: now.toISOString()
                })
                .eq('user_id', userId)

            scansUsed = 0
        }

        // Calcular próximo reset
        const nextResetDate = new Date(resetDate)
        nextResetDate.setDate(nextResetDate.getDate() + 30)

        const daysUntilReset = Math.max(0, Math.ceil((nextResetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

        return NextResponse.json({
            scans_used: scansUsed,
            scans_limit: MONTHLY_SCAN_LIMIT,
            scans_remaining: Math.max(0, MONTHLY_SCAN_LIMIT - scansUsed),
            reset_date: nextResetDate.toISOString(),
            days_until_reset: daysUntilReset,
            limit_reached: scansUsed >= MONTHLY_SCAN_LIMIT
        })

    } catch (error) {
        console.error('Erro ao verificar status de scans:', error)
        return NextResponse.json(
            { error: 'Erro interno' },
            { status: 500 }
        )
    }
}
