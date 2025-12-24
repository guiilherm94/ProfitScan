import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar usuários
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''

        const offset = (page - 1) * limit

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

        // Buscar acessos PS360 para todos os usuários
        const userIds = users.map(u => u.id)
        const { data: accesses } = await supabaseAdmin
            .from('ps360_access')
            .select('user_id, is_active, expires_at, ai_scans_used')
            .in('user_id', userIds)

        // Mapear usuários com acessos
        const usersWithAccess = users.map(user => {
            const access = accesses?.find(a => a.user_id === user.id)
            return {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
                created_at: user.created_at,
                ps360_access: access ? [access] : []
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
        const { email, password, name, grantPS360Access } = await request.json()

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
            email_confirm: true // Já confirma o email
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

            // Liberar acesso PS360 se solicitado
            if (grantPS360Access) {
                const expiresAt = new Date()
                expiresAt.setFullYear(expiresAt.getFullYear() + 1)

                await supabaseAdmin
                    .from('ps360_access')
                    .upsert({
                        user_id: userId,
                        email: email.toLowerCase(),
                        is_active: true,
                        expires_at: expiresAt.toISOString(),
                        ai_scans_used: 0,
                        ai_scans_reset_at: new Date().toISOString()
                    }, { onConflict: 'user_id' })
            }
        }

        return NextResponse.json({
            success: true,
            user: {
                id: userId,
                email,
                name
            }
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

        // Remover acesso PS360
        await supabaseAdmin
            .from('ps360_access')
            .delete()
            .eq('user_id', user_id)

        // Remover perfil
        await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', user_id)

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

// PATCH - Atualizar acesso do usuário
export async function PATCH(request: NextRequest) {
    try {
        const { user_id, action, email } = await request.json()

        if (!user_id || !action) {
            return NextResponse.json(
                { error: 'user_id e action são obrigatórios' },
                { status: 400 }
            )
        }

        if (action === 'grant_access') {
            // Liberar acesso PS360
            const expiresAt = new Date()
            expiresAt.setFullYear(expiresAt.getFullYear() + 1)

            await supabaseAdmin
                .from('ps360_access')
                .upsert({
                    user_id,
                    email: email?.toLowerCase(),
                    is_active: true,
                    expires_at: expiresAt.toISOString(),
                    ai_scans_used: 0,
                    ai_scans_reset_at: new Date().toISOString()
                }, { onConflict: 'user_id' })

            return NextResponse.json({ success: true, message: 'Acesso liberado' })

        } else if (action === 'revoke_access') {
            // Revogar acesso PS360
            await supabaseAdmin
                .from('ps360_access')
                .update({ is_active: false })
                .eq('user_id', user_id)

            return NextResponse.json({ success: true, message: 'Acesso revogado' })

        } else if (action === 'reset_scans') {
            // Resetar contador de scans
            await supabaseAdmin
                .from('ps360_access')
                .update({
                    ai_scans_used: 0,
                    ai_scans_reset_at: new Date().toISOString()
                })
                .eq('user_id', user_id)

            return NextResponse.json({ success: true, message: 'Scans resetados' })
        }

        return NextResponse.json(
            { error: 'Ação inválida' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        return NextResponse.json(
            { error: 'Erro interno' },
            { status: 500 }
        )
    }
}
