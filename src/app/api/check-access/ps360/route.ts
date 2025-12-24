import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const userId = request.nextUrl.searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 })
        }

        // Buscar acesso
        const { data: access, error } = await supabase
            .from('ps360_access')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error || !access) {
            return NextResponse.json({
                hasAccess: false,
                reason: 'not_found',
                message: 'Você não possui acesso ao ProfitScan 360º'
            })
        }

        // Verificar se está ativo
        if (!access.is_active) {
            return NextResponse.json({
                hasAccess: false,
                reason: 'inactive',
                message: 'Seu acesso ao ProfitScan 360º está desativado'
            })
        }

        // Verificar expiração (se tiver expires_at)
        if (access.expires_at) {
            const expiresAt = new Date(access.expires_at)
            const now = new Date()

            if (expiresAt < now) {
                return NextResponse.json({
                    hasAccess: false,
                    reason: 'expired',
                    expiresAt: access.expires_at,
                    message: 'Seu acesso ao ProfitScan 360º expirou'
                })
            }

            // Retorna dias restantes
            const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            return NextResponse.json({
                hasAccess: true,
                expiresAt: access.expires_at,
                daysLeft: daysLeft,
                message: `Acesso válido por mais ${daysLeft} dias`
            })
        }

        // Acesso antigo sem expiração (vitalício legado)
        return NextResponse.json({
            hasAccess: true,
            expiresAt: null,
            daysLeft: null,
            message: 'Acesso vitalício (legado)'
        })

    } catch (error) {
        console.error('Erro ao verificar acesso PS360:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
