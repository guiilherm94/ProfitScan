import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function POST(request: NextRequest) {
    const supabase = getSupabaseAdmin()

    try {
        const body = await request.json()
        const { user_id, ingredient_id } = body

        if (!user_id) {
            return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })
        }

        // Get all global taxes
        const { data: taxes } = await supabase
            .from('ps360_taxes')
            .select('*')
            .eq('user_id', user_id)
            .eq('is_global', true)

        // Get total fixed expenses
        const { data: expenses } = await supabase
            .from('ps360_fixed_expenses')
            .select('value')
            .eq('user_id', user_id)

        const totalFixedExpenses = expenses?.reduce((sum, e) => sum + Number(e.value), 0) || 0

        // Get all products needing recalculation
        let productsQuery = supabase
            .from('ps360_products')
            .select('*, ps360_product_ingredients(quantity, ingredient_id)')
            .eq('user_id', user_id)

        const { data: products } = await productsQuery

        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'Nenhum produto para recalcular', updated: 0 })
        }

        // Get all ingredients
        const { data: ingredients } = await supabase
            .from('ps360_ingredients')
            .select('id, unit_cost')
            .eq('user_id', user_id)

        const ingredientCosts = new Map(ingredients?.map(i => [i.id, Number(i.unit_cost)]) || [])

        // Calculate total revenue for fixed expense allocation
        const totalRevenue = products.reduce((sum, p) => sum + Number(p.avg_monthly_revenue || 0), 0)

        let updatedCount = 0

        for (const product of products) {
            let productionCost = 0

            if (product.type === 'resold') {
                productionCost = Number(product.purchase_cost)
            } else {
                // Sum ingredients
                const prodIngredients = product.ps360_product_ingredients || []
                for (const pi of prodIngredients) {
                    const cost = ingredientCosts.get(pi.ingredient_id) || 0
                    productionCost += cost * Number(pi.quantity)
                }
                // Divide by yield
                if (product.recipe_yield > 0) {
                    productionCost = productionCost / product.recipe_yield
                }
            }

            // Apply taxes
            let variableCosts = 0
            for (const tax of (taxes || [])) {
                if (tax.type === 'percentage') {
                    variableCosts += (Number(product.sale_price) * Number(tax.value)) / 100
                } else {
                    variableCosts += Number(tax.value)
                }
            }

            const totalCost = productionCost + variableCosts
            const contributionMargin = Number(product.sale_price) - totalCost

            // Calculate real profit with fixed expense allocation
            let realProfit = contributionMargin
            const avgRevenue = Number(product.avg_monthly_revenue || 0)
            if (avgRevenue > 0 && Number(product.sale_price) > 0 && totalRevenue > 0) {
                const unitsSold = avgRevenue / Number(product.sale_price)
                const fixedExpenseShare = (avgRevenue / totalRevenue) * totalFixedExpenses / unitsSold
                realProfit = contributionMargin - fixedExpenseShare
            }

            // Update product
            await supabase
                .from('ps360_products')
                .update({
                    production_cost: productionCost,
                    total_cost: totalCost,
                    contribution_margin: contributionMargin,
                    real_profit: realProfit,
                    updated_at: new Date().toISOString()
                })
                .eq('id', product.id)

            updatedCount++
        }

        return NextResponse.json({
            success: true,
            message: `${updatedCount} produtos recalculados`,
            updated: updatedCount
        })

    } catch (error) {
        console.error('Erro ao recalcular:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'
