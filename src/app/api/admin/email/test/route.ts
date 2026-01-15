import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Testar conexão SMTP
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, test_email } = body

        if (!smtp_host || !smtp_port || !smtp_user || !from_email) {
            return NextResponse.json({ error: 'Preencha todos os campos SMTP' }, { status: 400 })
        }

        // Se a senha é ••••••••, buscar do banco
        let password = smtp_password
        if (password === '••••••••' || !password) {
            const { data: settings } = await supabaseAdmin
                .from('email_settings')
                .select('smtp_password')
                .single()
            password = settings?.smtp_password
        }

        if (!password) {
            return NextResponse.json({ error: 'Senha SMTP não configurada' }, { status: 400 })
        }

        // Criar transporter
        const transporter = nodemailer.createTransport({
            host: smtp_host,
            port: smtp_port,
            secure: smtp_secure,
            auth: {
                user: smtp_user,
                pass: password
            }
        })

        // Verificar conexão
        await transporter.verify()

        // Enviar e-mail de teste se fornecido
        if (test_email) {
            await transporter.sendMail({
                from: `ProfitScan AI <${from_email}>`,
                to: test_email,
                subject: '✅ Teste de E-mail - ProfitScan AI',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background: #111; color: white;">
                        <h2 style="color: #00ff88;">✅ Configuração SMTP Funcionando!</h2>
                        <p>Este é um e-mail de teste do ProfitScan AI.</p>
                        <p>Se você recebeu este e-mail, suas configurações SMTP estão corretas.</p>
                        <hr style="border-color: #333; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">
                            Enviado em: ${new Date().toLocaleString('pt-BR')}
                        </p>
                    </div>
                `
            })

            return NextResponse.json({
                success: true,
                message: `Conexão OK! E-mail de teste enviado para ${test_email}`
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Conexão SMTP verificada com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao testar SMTP:', error)
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return NextResponse.json({
            error: `Falha na conexão SMTP: ${errorMessage}`
        }, { status: 500 })
    }
}
