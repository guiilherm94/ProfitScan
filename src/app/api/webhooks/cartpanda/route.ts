import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

// Supabase Admin Client (with service role for user creation)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Precisa da chave service_role
    { auth: { autoRefreshToken: false, persistSession: false } }
)

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
    try {
        // Validar que temos as variáveis necessárias
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY não configurada')
            return NextResponse.json({ error: 'Configuração incompleta' }, { status: 500 })
        }

        const body: CartPandaWebhook = await request.json()

        // Log para debug (remover em produção)
        console.log('CartPanda Webhook recebido:', body.event)

        // Só processar pagamentos aprovados
        if (body.event !== 'order.paid') {
            return NextResponse.json({
                success: true,
                message: `Evento ${body.event} ignorado`
            })
        }

        const { order } = body
        const customer = order.customer
        const email = customer?.email || order.email
        const fullName = customer?.full_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
        const phone = customer?.phone || order.phone
        const cpf = customer?.cpf || ''

        // Nome do produto (primeiro item)
        const productName = order.line_items?.[0]?.title || 'ProfitScan AI'
        const productId = order.line_items?.[0]?.product_id

        if (!email) {
            console.error('Email não encontrado no webhook')
            return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
        }

        // 1. Verificar se o pedido já foi processado
        const { data: existingOrder } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('cartpanda_order_id', order.id)
            .single()

        if (existingOrder) {
            console.log('Pedido já processado:', order.id)
            return NextResponse.json({
                success: true,
                message: 'Pedido já processado anteriormente'
            })
        }

        // 2. Verificar se usuário já existe no Supabase Auth
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase())

        let userId: string
        let isNewUser = false
        let generatedPassword = ''

        if (existingUser) {
            // Usuário já existe
            userId = existingUser.id
            console.log('Usuário existente:', email)
        } else {
            // Criar novo usuário
            generatedPassword = DEFAULT_PASSWORD

            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email.toLowerCase(),
                password: generatedPassword,
                email_confirm: true, // Já confirma o email automaticamente
                user_metadata: {
                    full_name: fullName,
                    phone: phone,
                    cpf: cpf,
                    source: 'cartpanda'
                }
            })

            if (createError) {
                console.error('Erro ao criar usuário:', createError)
                return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
            }

            userId = newUser.user.id
            isNewUser = true
            console.log('Novo usuário criado:', email)
        }

        // 3. Salvar o pedido
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

        // 4. Criar/atualizar acesso do usuário (ProfitScan AI principal)
        const { error: accessError } = await supabaseAdmin
            .from('user_access')
            .upsert({
                user_id: userId,
                email: email.toLowerCase(),
                order_id: orderRecord.id,
                access_type: 'lifetime',
                is_active: true
            }, {
                onConflict: 'email'
            })

        if (accessError) {
            console.error('Erro ao criar acesso:', accessError)
            // Não falhar, o pedido já foi salvo
        }

        // 4.1 Verificar se tem ORDERBUMP (Blindagem de Reputação)
        // O orderbump é identificado pelo nome ou product_id do produto adicional
        const isBlindagemProduct = order.line_items?.some(item =>
            item.title?.toLowerCase().includes('blindagem') ||
            item.title?.toLowerCase().includes('reputação') ||
            item.title?.toLowerCase().includes('reputacao')
            // Adicione aqui o product_id específico se preferir:
            // || item.product_id === SEU_PRODUCT_ID_AQUI
        )

        if (isBlindagemProduct) {
            console.log('Orderbump Blindagem detectado para:', email)

            const { error: reputationError } = await supabaseAdmin
                .from('reputation_access')
                .upsert({
                    user_id: userId,
                    email: email.toLowerCase(),
                    order_id: orderRecord.id,
                    is_active: true
                }, {
                    onConflict: 'email'
                })

            if (reputationError) {
                console.error('Erro ao criar acesso Blindagem:', reputationError)
            } else {
                console.log('Acesso Blindagem liberado para:', email)
            }
        }

        // 5. Enviar email de boas-vindas com credenciais
        if (isNewUser && generatedPassword) {
            const loginUrl = process.env.NEXT_PUBLIC_APP_URL
                ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
                : 'https://profitscan.ai/dashboard'

            console.log(`
        ========================================
        NOVO USUÁRIO CRIADO!
        Email: ${email}
        Senha: ${generatedPassword}
        Nome: ${fullName}
        Produto: ${productName}
        Valor: R$ ${order.total_price}
        ========================================
            `)

            // Enviar email com as credenciais
            const emailResult = await sendWelcomeEmail({
                to: email,
                name: fullName,
                password: generatedPassword,
                productName: productName,
                loginUrl: loginUrl
            })

            if (!emailResult.success) {
                console.error('Falha ao enviar email de boas-vindas:', emailResult.error)
            }
        }

        return NextResponse.json({
            success: true,
            message: isNewUser ? 'Usuário criado com sucesso' : 'Acesso atualizado',
            data: {
                orderId: orderRecord.id,
                userId: userId,
                email: email,
                isNewUser: isNewUser
            }
        })

    } catch (error) {
        console.error('Erro no webhook CartPanda:', error)
        return NextResponse.json(
            { error: 'Erro interno ao processar webhook' },
            { status: 500 }
        )
    }
}

// Endpoint GET para verificar se está funcionando
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Webhook CartPanda ativo',
        timestamp: new Date().toISOString()
    })
}
