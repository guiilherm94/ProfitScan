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

        console.log('Webhook BLINDAGEM recebido:', body.event)

        if (body.event !== 'order.paid') {
            return NextResponse.json({ success: true, message: `Evento ${body.event} ignorado` })
        }

        const { order } = body
        const customer = order.customer
        const email = customer?.email || order.email
        const fullName = customer?.full_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
        const phone = customer?.phone || order.phone
        const cpf = customer?.cpf || ''
        const productName = order.line_items?.[0]?.title || 'Blindagem de Reputação'
        const productId = order.line_items?.[0]?.product_id

        if (!email) {
            return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
        }

        // Verificar/criar usuário (caso seja compra avulsa)
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase())

        let userId: string
        let isNewUser = false
        let generatedPassword = ''

        if (existingUser) {
            userId = existingUser.id
        } else {
            // Criar usuário se não existir (compra avulsa do Blindagem)
            generatedPassword = DEFAULT_PASSWORD

            // Usar inviteUserByEmail para enviar email automaticamente
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                email.toLowerCase(),
                {
                    data: { full_name: fullName, phone, cpf, source: 'cartpanda_blindagem' }
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
            console.log(`NOVO USUÁRIO BLINDAGEM: ${email} | Email de convite enviado!`)
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
            // Pode ser duplicado se orderbump veio junto com produto principal
            console.log('Pedido pode já existir (orderbump):', orderError.message)
        }

        // Liberar acesso Blindagem de Reputação
        const { error: accessError } = await supabaseAdmin
            .from('reputation_access')
            .upsert({
                user_id: userId,
                email: email.toLowerCase(),
                order_id: orderRecord?.id,
                is_active: true
            }, { onConflict: 'email' })

        if (accessError) {
            console.error('Erro ao liberar Blindagem:', accessError)
        }

        console.log(`BLINDAGEM liberada para: ${email}`)

        return NextResponse.json({
            success: true,
            message: 'Acesso Blindagem liberado',
            product: 'blindagem',
            isNewUser
        })

    } catch (error) {
        console.error('Erro webhook Blindagem:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', product: 'blindagem', timestamp: new Date().toISOString() })
}

export const dynamic = 'force-dynamic'
