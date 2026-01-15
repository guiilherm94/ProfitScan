import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

const getSupabaseAdmin = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

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

const DEFAULT_PASSWORD = 'senha123'

export async function POST(request: NextRequest) {
    const supabaseAdmin = getSupabaseAdmin()

    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY não configurada')
            return NextResponse.json({ error: 'Configuração incompleta' }, { status: 500 })
        }

        const body: CartPandaWebhook = await request.json()

        console.log('Webhook PROFITSCAN360 recebido:', body.event)

        if (body.event !== 'order.paid') {
            return NextResponse.json({ success: true, message: `Evento ${body.event} ignorado` })
        }

        const { order } = body
        const customer = order.customer
        const email = customer?.email || order.email
        const fullName = customer?.full_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Cliente'
        const phone = customer?.phone || order.phone
        const cpf = customer?.cpf || ''
        const productName = order.line_items?.[0]?.title || 'ProfitScan 360º'
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

            const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email.toLowerCase(),
                password: generatedPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    phone: phone,
                    cpf: cpf,
                    source: 'cartpanda_profitscan360'
                }
            })

            if (createError) {
                console.error('Erro ao criar usuário:', createError)
                return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
            }

            userId = createData.user.id
            isNewUser = true
            console.log(`NOVO USUÁRIO PROFITSCAN360: ${email}`)

            const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://profitscan.ai'
            try {
                await sendWelcomeEmail({
                    to: email.toLowerCase(),
                    name: fullName,
                    password: generatedPassword,
                    productName: productName,
                    loginUrl: loginUrl
                })
            } catch (emailError) {
                console.error('Erro ao enviar email:', emailError)
            }
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

        // Liberar acesso ProfitScan 360º (1 ano de acesso)
        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)

        const { error: accessError } = await supabaseAdmin
            .from('ps360_access')
            .upsert({
                user_id: userId,
                email: email.toLowerCase(),
                order_id: orderRecord.id,
                is_active: true,
                expires_at: expiresAt.toISOString()
            }, { onConflict: 'email' })

        if (accessError) {
            console.error('Erro ao liberar PS360:', accessError)
        }

        console.log(`PROFITSCAN 360º liberado para: ${email}`)

        return NextResponse.json({
            success: true,
            message: isNewUser ? 'Usuário criado e acesso liberado' : 'Acesso liberado',
            product: 'profitscan360'
        })

    } catch (error) {
        console.error('Erro webhook ProfitScan360:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', product: 'profitscan360', timestamp: new Date().toISOString() })
}

export const dynamic = 'force-dynamic'
