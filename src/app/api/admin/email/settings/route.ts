import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Obter configurações SMTP
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('email_settings')
            .select('*')
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        // Não retornar a senha em texto claro
        if (data) {
            return NextResponse.json({
                ...data,
                smtp_password: data.smtp_password ? '••••••••' : ''
            })
        }

        return NextResponse.json({
            smtp_host: 'smtp.hostinger.com',
            smtp_port: 465,
            smtp_secure: true,
            smtp_user: '',
            smtp_password: '',
            from_email: '',
            from_name: 'ProfitScan AI',
            is_active: false
        })

    } catch (error) {
        console.error('Erro ao buscar configurações SMTP:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

// PUT - Atualizar configurações SMTP
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, from_name, is_active } = body

        // Verificar se já existe configuração
        const { data: existing } = await supabaseAdmin
            .from('email_settings')
            .select('id, smtp_password')
            .single()

        const updateData: Record<string, unknown> = {
            smtp_host,
            smtp_port,
            smtp_secure,
            smtp_user,
            from_email,
            from_name,
            is_active,
            updated_at: new Date().toISOString()
        }

        // Só atualiza senha se ela foi alterada (não é '••••••••')
        if (smtp_password && smtp_password !== '••••••••') {
            updateData.smtp_password = smtp_password
        }

        if (existing) {
            const { error } = await supabaseAdmin
                .from('email_settings')
                .update(updateData)
                .eq('id', existing.id)

            if (error) throw error
        } else {
            if (smtp_password && smtp_password !== '••••••••') {
                updateData.smtp_password = smtp_password
            }
            const { error } = await supabaseAdmin
                .from('email_settings')
                .insert(updateData)

            if (error) throw error
        }

        return NextResponse.json({ success: true, message: 'Configurações salvas!' })

    } catch (error) {
        console.error('Erro ao salvar configurações SMTP:', error)
        return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
    }
}
