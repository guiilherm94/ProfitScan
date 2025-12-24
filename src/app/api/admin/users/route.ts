import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar usuários com todos os acessos
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''

        // Buscar usuários do auth.users
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            page: page,
            perPage: limit
        })

        if (authError) throw authError

        // Filtrar por busca se necessário
        let users = authUsers.users || []
        if (search) {
            users = users.filter(u =>
                u.email?.toLowerCase().includes(search.toLowerCase())
            )
        }

        const userIds = users.map(u => u.id)

        // Buscar acessos de TODOS os produtos
        const [detectorResult, ps360Result, reputationResult] = await Promise.all([
            supabaseAdmin.from('user_access').select('user_id, is_active, expires_at').in('user_id', userIds),
            supabaseAdmin.from('ps360_access').select('user_id, is_active, expires_at, ai_scans_used').in('user_id', userIds),
            supabaseAdmin.from('reputation_access').select('user_id, is_active').in('user_id', userIds)
        ])

        const detectorAccesses = detectorResult.data || []
        const ps360Accesses = ps360Result.data || []
        const reputationAccesses = reputationResult.data || []

        // Mapear usuários com todos os acessos
        const usersWithAccess = users.map(user => {
            const detector = detectorAccesses.find(a => a.user_id === user.id)
            const ps360 = ps360Accesses.find(a => a.user_id === user.id)
            const reputation = reputationAccesses.find(a => a.user_id === user.id)

            return {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                created_at: user.created_at,
                // Acessos por produto
                detector_access: detector ? { is_active: detector.is_active, expires_at: detector.expires_at } : null,
                ps360_access: ps360 ? { is_active: ps360.is_active, expires_at: ps360.expires_at, ai_scans_used: ps360.ai_scans_used } : null,
                reputation_access: reputation ? { is_active: reputation.is_active } : null
            }
        })

        return NextResponse.json({
            users: usersWithAccess,
            pagination: {
                page,
                limit,
                total: authUsers.users?.length || 0,
                totalPages: Math.ceil((authUsers.users?.length || 0) / limit)
            }
        })

    } catch (error) {
        console.error('Erro ao listar usuários:', error)
        return NextResponse.json(
            { error: 'Erro interno', details: String(error) },
            { status: 500 }
        )
    }
}

// POST - Criar usuário
export async function POST(request: NextRequest) {
    try {
        const { email, password, name, grantDetector, grantPS360, grantReputation } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e senha são obrigatórios' },
                { status: 400 }
            )
        }

        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            )
        }

        const userId = authData.user?.id

        // Criar perfil
        if (userId) {
            await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    email: email.toLowerCase(),
                    name: name || email.split('@')[0]
                })

            // Liberar acessos solicitados
            if (grantDetector) {
                await supabaseAdmin.from('user_access').insert({
                    user_id: userId,
                    email: email.toLowerCase(),
                    access_type: 'lifetime',
                    is_active: true
                })
            }

            if (grantPS360) {
                const expiresAt = new Date()
                expiresAt.setFullYear(expiresAt.getFullYear() + 1)

                await supabaseAdmin.from('ps360_access').insert({
                    user_id: userId,
                    email: email.toLowerCase(),
                    is_active: true,
                    expires_at: expiresAt.toISOString(),
                    ai_scans_used: 0
                })
            }

            if (grantReputation) {
                await supabaseAdmin.from('reputation_access').insert({
                    user_id: userId,
                    email: email.toLowerCase(),
                    is_active: true
                })
            }
        }

        return NextResponse.json({
            success: true,
            user: { id: userId, email, name }
        })

    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        return NextResponse.json(
            { error: 'Erro interno' },
            { status: 500 }
        )
    }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
    try {
        const { user_id } = await request.json()

        if (!user_id) {
            return NextResponse.json(
                { error: 'user_id é obrigatório' },
                { status: 400 }
            )
        }

        // Remover todos os acessos
        await Promise.all([
            supabaseAdmin.from('user_access').delete().eq('user_id', user_id),
            supabaseAdmin.from('ps360_access').delete().eq('user_id', user_id),
            supabaseAdmin.from('reputation_access').delete().eq('user_id', user_id),
            supabaseAdmin.from('profiles').delete().eq('id', user_id)
        ])

        // Remover usuário do Auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        return NextResponse.json(
            { error: 'Erro interno' },
            { status: 500 }
        )
    }
}

// PATCH - Gerenciar acessos por produto
export async function PATCH(request: NextRequest) {
    try {
        const { user_id, email, product, action } = await request.json()

        if (!user_id || !product || !action) {
            return NextResponse.json(
                { error: 'user_id, product e action são obrigatórios' },
                { status: 400 }
            )
        }

        // Mapear produto para tabela
        const tableMap: Record<string, string> = {
            'detector': 'user_access',
            'ps360': 'ps360_access',
            'reputation': 'reputation_access'
        }

        const table = tableMap[product]
        if (!table) {
            return NextResponse.json({ error: 'Produto inválido' }, { status: 400 })
        }

        if (action === 'grant') {
            // Verificar se já existe
            const { data: existing } = await supabaseAdmin
                .from(table)
                .select('id')
                .eq('user_id', user_id)
                .single()

            if (existing) {
                // Atualizar para ativo
                const updateData: Record<string, unknown> = { is_active: true }

                // PS360 tem expiração de 1 ano
                if (product === 'ps360') {
                    const expiresAt = new Date()
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
                    updateData.expires_at = expiresAt.toISOString()
                    updateData.ai_scans_used = 0
                    updateData.ai_scans_reset_at = new Date().toISOString()
                }

                const { error } = await supabaseAdmin.from(table).update(updateData).eq('user_id', user_id)
                if (error) throw error
            } else {
                // Criar novo registro
                const insertData: Record<string, unknown> = {
                    user_id,
                    email: email?.toLowerCase(),
                    is_active: true
                }

                // Configurações específicas por produto
                if (product === 'detector') {
                    insertData.access_type = 'lifetime'
                } else if (product === 'ps360') {
                    const expiresAt = new Date()
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
                    insertData.expires_at = expiresAt.toISOString()
                    insertData.ai_scans_used = 0
                    insertData.ai_scans_reset_at = new Date().toISOString()
                }

                const { error } = await supabaseAdmin.from(table).insert(insertData)
                if (error) throw error
            }

            const productNames: Record<string, string> = {
                'detector': 'ProfitScan Detector',
                'ps360': 'ProfitScan 360',
                'reputation': 'Blindagem de Reputação'
            }
            return NextResponse.json({ success: true, message: `${productNames[product]} liberado!` })

        } else if (action === 'revoke') {
            const { error } = await supabaseAdmin
                .from(table)
                .update({ is_active: false })
                .eq('user_id', user_id)

            if (error) throw error

            return NextResponse.json({ success: true, message: 'Acesso revogado!' })

        } else if (action === 'reset_scans' && product === 'ps360') {
            const { error } = await supabaseAdmin
                .from('ps360_access')
                .update({
                    ai_scans_used: 0,
                    ai_scans_reset_at: new Date().toISOString()
                })
                .eq('user_id', user_id)

            if (error) throw error

            return NextResponse.json({ success: true, message: 'Scans resetados!' })
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })

    } catch (error) {
        console.error('Erro ao gerenciar acesso:', error)
        return NextResponse.json(
            { error: `Erro: ${error instanceof Error ? error.message : 'desconhecido'}` },
            { status: 500 }
        )
    }
}
