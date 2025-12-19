import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
        }

        // Verificar se tem acesso na tabela user_access
        const { data: access, error } = await supabaseAdmin
            .from('user_access')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('is_active', true)
            .single()

        if (error || !access) {
            return NextResponse.json({
                hasAccess: false,
                message: 'Usuário não possui acesso'
            })
        }

        // Verificar se expirou (se não for vitalício)
        if (access.expires_at && new Date(access.expires_at) < new Date()) {
            return NextResponse.json({
                hasAccess: false,
                message: 'Acesso expirado'
            })
        }

        return NextResponse.json({
            hasAccess: true,
            accessType: access.access_type,
            expiresAt: access.expires_at,
            createdAt: access.created_at
        })

    } catch (error) {
        console.error('Erro ao verificar acesso:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
