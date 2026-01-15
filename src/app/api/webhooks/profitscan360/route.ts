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
        console.log('PS360 - Order ID:', body.order?.id)

        if (body.event !== 'order.paid') {
            console.log('PS360 - Evento ignorado:', body.event)
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

        console.log('PS360 - Dados extraídos:', { email, fullName, productName, productId })

        if (!email) {
            console.log('PS360 - ERRO: Email não encontrado')
            return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
        }

        // Verificar se pedido já processado
        console.log('PS360 - Verificando pedido existente...')
        const { data: existingOrder, error: checkError } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('cartpanda_order_id', order.id)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            console.log('PS360 - Erro ao verificar pedido:', checkError)
        }

        if (existingOrder) {
            console.log('PS360 - Pedido já processado, ignorando:', order.id)
            return NextResponse.json({ success: true, message: 'Pedido já processado' })
        }

        console.log('PS360 - Pedido novo, continuando processamento...')

        // Verificar/criar usuário
        console.log('PS360 - Buscando usuários existentes...')
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) {
            console.log('PS360 - Erro ao listar usuários:', listError)
        }
        const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase())

        let userId: string
        let isNewUser = false
        let generatedPassword = ''

        if (existingUser) {
            userId = existingUser.id
            console.log('PS360 - Usuário existente encontrado:', userId)
        } else {
            console.log('PS360 - Criando novo usuário...')
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
                console.error('PS360 - Erro ao criar usuário:', createError)
                return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
            }

            userId = createData.user.id
            isNewUser = true
            console.log(`PS360 - NOVO USUÁRIO CRIADO: ${email} | ID: ${userId}`)

            console.log('PS360 - Enviando email de boas-vindas...')
            const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://profitscan.ai'
            try {
                await sendWelcomeEmail({
                    to: email.toLowerCase(),
                    name: fullName,
                    password: generatedPassword,
                    productName: productName,
                    loginUrl: loginUrl
                })
                console.log('PS360 - Email de boas-vindas enviado para:', email)
            } catch (emailError) {
                console.error('PS360 - Erro ao enviar email:', emailError)
                // Continua mesmo se falhar o email
            }
        }

        // Salvar pedido
        console.log('PS360 - Salvando pedido...')
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
            console.error('PS360 - Erro ao salvar pedido:', orderError)
            return NextResponse.json({ error: 'Erro ao salvar pedido' }, { status: 500 })
        }

        console.log('PS360 - Pedido salvo com sucesso, ID:', orderRecord.id)

        // Liberar acesso ProfitScan 360º (1 ano de acesso)
        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Adiciona 1 ano

        console.log(`PS360 - Liberando acesso para: ${email}, user_id: ${userId}, order_id: ${orderRecord.id}`)

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
            console.error('Detalhes do erro:', JSON.stringify(accessError, null, 2))
            // Não retorna erro aqui para não perder o pedido, mas loga detalhadamente
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
