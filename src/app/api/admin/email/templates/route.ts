import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar todos os templates
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .order('template_name')

        if (error) throw error

        return NextResponse.json(data || [])

    } catch (error) {
        console.error('Erro ao buscar templates:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

// PUT - Atualizar template
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { template_key, subject, html_content, is_active } = body

        if (!template_key) {
            return NextResponse.json({ error: 'template_key é obrigatório' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('email_templates')
            .update({
                subject,
                html_content,
                is_active,
                updated_at: new Date().toISOString()
            })
            .eq('template_key', template_key)

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Template salvo!' })

    } catch (error) {
        console.error('Erro ao salvar template:', error)
        return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
    }
}

// POST - Criar novo template
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { template_key, template_name, subject, html_content, variables } = body

        if (!template_key || !template_name || !subject || !html_content) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('email_templates')
            .insert({
                template_key,
                template_name,
                subject,
                html_content,
                variables: variables || [],
                is_active: true
            })

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Template já existe com essa chave' }, { status: 400 })
            }
            throw error
        }

        return NextResponse.json({ success: true, message: 'Template criado!' })

    } catch (error) {
        console.error('Erro ao criar template:', error)
        return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 })
    }
}
