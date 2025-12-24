import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Unit {
    id: string
    user_id: string | null
    symbol: string
    name: string
    is_global: boolean
    created_at: string
}

// Unidades padrão para fallback quando a tabela não existir
const DEFAULT_UNITS = [
    { id: 'default-kg', symbol: 'kg', name: 'Quilograma', is_global: true },
    { id: 'default-g', symbol: 'g', name: 'Grama', is_global: true },
    { id: 'default-L', symbol: 'L', name: 'Litro', is_global: true },
    { id: 'default-ml', symbol: 'ml', name: 'Mililitro', is_global: true },
    { id: 'default-un', symbol: 'un', name: 'Unidade', is_global: true },
]

// GET - Lista unidades (globais + do usuário)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')

        // Busca unidades globais + unidades do usuário
        let query = supabaseAdmin
            .from('ps360_units')
            .select('*')
            .order('is_global', { ascending: false })
            .order('symbol')

        if (userId) {
            query = query.or(`is_global.eq.true,user_id.eq.${userId}`)
        } else {
            query = query.eq('is_global', true)
        }

        const { data, error } = await query

        if (error) {
            // Se a tabela não existir, retorna unidades padrão
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('⚠️ [Units API] Tabela não existe, usando unidades padrão')
                return NextResponse.json(DEFAULT_UNITS)
            }
            console.error('❌ [Units API] Erro ao buscar:', error)
            return NextResponse.json(DEFAULT_UNITS) // Fallback
        }

        return NextResponse.json(data || DEFAULT_UNITS)
    } catch (error) {
        console.error('❌ [Units API] Erro:', error)
        return NextResponse.json(DEFAULT_UNITS) // Fallback em caso de erro
    }
}

// POST - Cria nova unidade do usuário
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, symbol, name } = body

        if (!user_id || !symbol || !name) {
            return NextResponse.json(
                { error: 'user_id, symbol e name são obrigatórios' },
                { status: 400 }
            )
        }

        // Verifica se já existe uma unidade com esse símbolo para o usuário
        const { data: existing } = await supabaseAdmin
            .from('ps360_units')
            .select('id')
            .or(`and(user_id.eq.${user_id},symbol.eq.${symbol}),and(is_global.eq.true,symbol.eq.${symbol})`)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Já existe uma unidade com esse símbolo' },
                { status: 409 }
            )
        }

        const { data, error } = await supabaseAdmin
            .from('ps360_units')
            .insert({
                user_id,
                symbol: symbol.trim(),
                name: name.trim(),
                is_global: false
            })
            .select()
            .single()

        if (error) {
            console.error('❌ [Units API] Erro ao criar:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log(`✅ [Units API] Unidade criada: ${symbol} (${name})`)
        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('❌ [Units API] Erro:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

// DELETE - Remove unidade do usuário (não globais)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const userId = searchParams.get('user_id')

        if (!id || !userId) {
            return NextResponse.json(
                { error: 'id e user_id são obrigatórios' },
                { status: 400 }
            )
        }

        // Verifica se a unidade pertence ao usuário e não é global
        const { data: unit } = await supabaseAdmin
            .from('ps360_units')
            .select('*')
            .eq('id', id)
            .single()

        if (!unit) {
            return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 })
        }

        if (unit.is_global) {
            return NextResponse.json(
                { error: 'Não é possível excluir unidades globais' },
                { status: 403 }
            )
        }

        if (unit.user_id !== userId) {
            return NextResponse.json(
                { error: 'Você não tem permissão para excluir esta unidade' },
                { status: 403 }
            )
        }

        const { error } = await supabaseAdmin
            .from('ps360_units')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('❌ [Units API] Erro ao excluir:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log(`🗑️ [Units API] Unidade excluída: ${unit.symbol}`)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('❌ [Units API] Erro:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
