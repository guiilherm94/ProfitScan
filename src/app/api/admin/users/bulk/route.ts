import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UserData {
    id: string
    email: string
}

// POST - Ação em massa para gerenciar acessos
export async function POST(request: NextRequest) {
    try {
        const { user_ids, product, action, users_data } = await request.json()

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return NextResponse.json(
                { error: 'user_ids é obrigatório e deve ser um array não vazio' },
                { status: 400 }
            )
        }

        if (!product || !action) {
            return NextResponse.json(
                { error: 'product e action são obrigatórios' },
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

        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        // Processar cada usuário
        for (const userId of user_ids) {
            try {
                const userData = users_data?.find((u: UserData) => u.id === userId)
                const email = userData?.email?.toLowerCase()

                if (action === 'grant') {
                    // Verificar se já existe
                    const { data: existing } = await supabaseAdmin
                        .from(table)
                        .select('id')
                        .eq('user_id', userId)
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

                        const { error } = await supabaseAdmin.from(table).update(updateData).eq('user_id', userId)
                        if (error) throw error
                    } else {
                        // Criar novo registro
                        const insertData: Record<string, unknown> = {
                            user_id: userId,
                            email: email,
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

                    successCount++

                } else if (action === 'revoke') {
                    const { error } = await supabaseAdmin
                        .from(table)
                        .update({ is_active: false })
                        .eq('user_id', userId)

                    if (error) throw error
                    successCount++
                }

            } catch (error) {
                errorCount++
                errors.push(`Erro ao processar usuário ${userId}: ${error instanceof Error ? error.message : 'desconhecido'}`)
            }
        }

        const productNames: Record<string, string> = {
            'detector': 'ProfitScan Detector',
            'ps360': 'ProfitScan 360',
            'reputation': 'Blindagem de Reputação'
        }

        const actionText = action === 'grant' ? 'liberado' : 'revogado'

        return NextResponse.json({
            success: true,
            message: `${productNames[product]} ${actionText} para ${successCount} usuário(s).${errorCount > 0 ? ` ${errorCount} erro(s).` : ''}`,
            details: {
                successCount,
                errorCount,
                errors: errors.length > 0 ? errors : undefined
            }
        })

    } catch (error) {
        console.error('Erro ao processar ação em massa:', error)
        return NextResponse.json(
            { error: `Erro: ${error instanceof Error ? error.message : 'desconhecido'}` },
            { status: 500 }
        )
    }
}
