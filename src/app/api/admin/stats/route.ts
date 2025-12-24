import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateScanCost, AI_COSTS } from '@/lib/ai-config'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verificar se é admin
async function isAdmin(request: NextRequest): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) return false

    // Pode ser expandido para verificar sessão/token
    const authHeader = request.headers.get('x-admin-email')
    return authHeader === adminEmail
}

export async function GET(request: NextRequest) {
    try {
        // Buscar estatísticas

        // 1. Total de usuários (auth.users)
        const { count: totalUsers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // 2. Assinantes PS360 ativos
        const { count: activeSubscribers } = await supabaseAdmin
            .from('ps360_access')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)

        // 3. Total de scans realizados
        const { data: scansData } = await supabaseAdmin
            .from('ps360_access')
            .select('ai_scans_used')

        const totalScans = scansData?.reduce((sum, row) => sum + (row.ai_scans_used || 0), 0) || 0

        // 4. Scans do mês atual
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: monthlyScansData } = await supabaseAdmin
            .from('ps360_access')
            .select('ai_scans_used, ai_scans_reset_at')
            .gte('ai_scans_reset_at', startOfMonth.toISOString())

        const monthlyScans = monthlyScansData?.reduce((sum, row) => sum + (row.ai_scans_used || 0), 0) || 0

        // 5. Custo estimado (baseado em GPT-5 nano)
        const costPerScan = calculateScanCost('gpt5-nano')
        const estimatedMonthlyCost = monthlyScans * costPerScan
        const estimatedTotalCost = totalScans * costPerScan

        // 6. Pedidos/Faturamento
        const { data: ordersData } = await supabaseAdmin
            .from('orders')
            .select('amount, status, created_at')
            .eq('status', 'paid')

        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0

        // Faturamento do mês
        const monthlyOrders = ordersData?.filter(order =>
            new Date(order.created_at) >= startOfMonth
        ) || []
        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.amount || 0), 0)

        return NextResponse.json({
            users: {
                total: totalUsers || 0,
                activeSubscribers: activeSubscribers || 0
            },
            scans: {
                total: totalScans,
                monthly: monthlyScans
            },
            costs: {
                perScan: costPerScan,
                monthlyEstimate: estimatedMonthlyCost,
                totalEstimate: estimatedTotalCost,
                rates: AI_COSTS
            },
            revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue,
                ordersThisMonth: monthlyOrders.length
            }
        })

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        return NextResponse.json(
            { error: 'Erro interno' },
            { status: 500 }
        )
    }
}
