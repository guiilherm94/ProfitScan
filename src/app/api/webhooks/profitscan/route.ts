import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

// Supabase Admin Client
const getSupabaseAdmin = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

// Tipos do webhook CartPanda
interface CartPandaCustomer {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    cpf: string
    full_name: string
}

interface CartPandaLineItem {
    id: number
    product_id: number
    title: string
    price: number
    quantity: number
}

interface CartPandaOrder {
    id: number
    email: string
    phone: string
    total_price: string
    payment_type: string
    payment_status: number
    customer: CartPandaCustomer
    line_items: CartPandaLineItem[]
}

interface CartPandaWebhook {
    event: string
    order: CartPandaOrder
}

// Gerar senha aleatória segura
// Senha padrão para novos usuários (pode ser alterada nas configurações)
const DEFAULT_PASSWORD = 'senha123'

export async function POST(request: NextRequest) {
    const supabaseAdmin = getSupabaseAdmin()

    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY não configurada')
            return NextResponse.json({ error: 'Configuração incompleta' }, { status: 500 })
        }

        const body: CartPandaWebhook = await request.json()

        console.log('Webhook PROFITSCAN recebido:', body.event)

        if (body.event !== 'order.paid') {
            return NextResponse.json({ success: true, message: `Evento ${body.event} ignorado` })
        }

        const { order } = body
        const customer = order.customer
        const email = customer?.email || order.email
        const fullName = customer?.full_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
        const phone = customer?.phone || order.phone
        const cpf = customer?.cpf || ''
        const productName = order.line_items?.[0]?.title || 'ProfitScan AI'
        const productId = order.line_items?.[0]?.product_id

        if (!email) {
            return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
        }

        // Verificar se pedido já processado
        const { data: existingOrder } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('cartpanda_order_id', order.id)
            .single()

        if (existingOrder) {
            return NextResponse.json({ success: true, message: 'Pedido já processado' })
        }

        // Verificar/criar usuário
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase())

        let userId: string
        let isNewUser = false
        let generatedPassword = ''

        if (existingUser) {
            userId = existingUser.id
        } else {
            generatedPassword = DEFAULT_PASSWORD

            // Usar inviteUserByEmail para enviar email automaticamente
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                email.toLowerCase(),
                {
                    data: { full_name: fullName, phone, cpf, source: 'cartpanda_profitscan' }
                }
            )

            if (inviteError) {
                console.error('Erro ao convidar usuário:', inviteError)
                return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
            }

            userId = inviteData.user.id

            // Definir a senha padrão para o usuário
            await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: generatedPassword
            })

            isNewUser = true
            console.log(`NOVO USUÁRIO PROFITSCAN: ${email} | Email de convite enviado!`)
        }

        // Salvar pedido
        const { data: orderRecord, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                cartpanda_order_id: order.id,
                user_id: userId,
                customer_email: email.toLowerCase(),
                customer_name: fullName,
                customer_phone: phone,
                customer_cpf: cpf,
                product_name: productName,
                product_id: productId,
                amount: parseFloat(order.total_price),
                payment_type: order.payment_type || 'pix',
                payment_status: 'paid',
                order_data: body
            })
            .select()
            .single()

        if (orderError) {
            console.error('Erro ao salvar pedido:', orderError)
            return NextResponse.json({ error: 'Erro ao salvar pedido' }, { status: 500 })
        }

        // Liberar acesso ProfitScan AI
        await supabaseAdmin
            .from('user_access')
            .upsert({
                user_id: userId,
                email: email.toLowerCase(),
                order_id: orderRecord.id,
                access_type: 'lifetime',
                is_active: true
            }, { onConflict: 'email' })

        // Log do novo usuário (email será enviado pelo Supabase automaticamente)
        if (isNewUser) {
            console.log(`NOVO USUÁRIO PROFITSCAN: ${email} | Senha: ${generatedPassword}`)
            console.log('Email de confirmação será enviado pelo Supabase.')
        }

        return NextResponse.json({
            success: true,
            message: isNewUser ? 'Usuário criado' : 'Acesso atualizado',
            product: 'profitscan'
        })

    } catch (error) {
        console.error('Erro webhook ProfitScan:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', product: 'profitscan', timestamp: new Date().toISOString() })
}

export const dynamic = 'force-dynamic'
