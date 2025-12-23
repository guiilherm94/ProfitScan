'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Loader2, Home, Package, Percent, Building2, ShoppingBag,
    ArrowLeft, Settings, PieChart, Plus, Trash2,
    Edit2, X, Save, TrendingUp, DollarSign,
    AlertTriangle, CheckCircle, Upload, Copy, Sparkles, RefreshCw
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Ingredient {
    id: string
    name: string
    unit: string
    unit_cost: number
}

interface Tax {
    id: string
    name: string
    type: 'percentage' | 'fixed'
    value: number
    is_global: boolean
}

interface ProductIngredient {
    ingredient_id: string
    quantity: number
}

interface ProductComponent {
    child_product_id: string
    quantity: number
}

interface Product {
    id: string
    name: string
    type: 'resold' | 'manufactured'
    purchase_cost: number
    recipe_yield: number
    sale_price: number
    avg_monthly_revenue: number
    production_cost: number
    total_cost: number
    contribution_margin: number
    real_profit: number
}

export default function ProdutosPage() {
    const searchParams = useSearchParams()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<Product[]>([])
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [taxes, setTaxes] = useState<Tax[]>([])
    const [totalFixedExpenses, setTotalFixedExpenses] = useState(0)
    const [showForm, setShowForm] = useState(searchParams.get('new') === 'true')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showRevenueModal, setShowRevenueModal] = useState(false)
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [aiLoading, setAiLoading] = useState(false)
    const [recalculating, setRecalculating] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        name: '',
        type: 'manufactured' as 'resold' | 'manufactured',
        purchase_cost: 0,
        recipe_yield: 1,
        sale_price: 0,
        avg_monthly_revenue: 0,
        ingredients: [] as ProductIngredient[],
        productComponents: [] as ProductComponent[],
        disabledTaxes: [] as string[]
    })

    const fetchData = useCallback(async () => {
        const [productsRes, ingredientsRes, taxesRes, expensesRes] = await Promise.all([
            supabase.from('ps360_products').select('*').order('name'),
            supabase.from('ps360_ingredients').select('id, name, unit, unit_cost').order('name'),
            supabase.from('ps360_taxes').select('*').order('name'),
            supabase.from('ps360_fixed_expenses').select('value')
        ])
        setProducts(productsRes.data || [])
        setIngredients(ingredientsRes.data || [])
        setTaxes(taxesRes.data || [])
        setTotalFixedExpenses(expensesRes.data?.reduce((sum, e) => sum + Number(e.value), 0) || 0)
    }, [])

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { window.location.href = '/'; return }

            const { data: access } = await supabase
                .from('ps360_access')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single()

            if (!access) { window.location.href = '/dashboard'; return }

            setUser(session.user)
            await fetchData()
            setLoading(false)
        }
        init()
    }, [fetchData])

    // Calculate costs
    const calculateCosts = () => {
        let productionCost = 0

        if (form.type === 'resold') {
            productionCost = form.purchase_cost
        } else {
            // Sum ingredients
            for (const pi of form.ingredients) {
                const ing = ingredients.find(i => i.id === pi.ingredient_id)
                if (ing) {
                    productionCost += Number(ing.unit_cost) * pi.quantity
                }
            }
            // Sum product components
            for (const pc of form.productComponents) {
                const prod = products.find(p => p.id === pc.child_product_id)
                if (prod) {
                    productionCost += Number(prod.total_cost) * pc.quantity
                }
            }
            // Divide by yield
            if (form.recipe_yield > 0) {
                productionCost = productionCost / form.recipe_yield
            }
        }

        // Apply taxes (excluding disabled ones)
        let variableCosts = 0
        const activeTaxes = taxes.filter(t => t.is_global && !form.disabledTaxes.includes(t.id))
        for (const tax of activeTaxes) {
            if (tax.type === 'percentage') {
                variableCosts += (form.sale_price * tax.value) / 100
            } else {
                variableCosts += tax.value
            }
        }

        const totalCost = productionCost + variableCosts
        const contributionMargin = form.sale_price - totalCost

        // Calculate real profit with fixed expenses allocation
        let realProfit = contributionMargin
        if (form.avg_monthly_revenue > 0 && form.sale_price > 0) {
            const totalRev = products.reduce((sum, p) => sum + Number(p.avg_monthly_revenue || 0), 0) + form.avg_monthly_revenue
            const unitsSold = form.avg_monthly_revenue / form.sale_price
            const fixedExpenseShare = totalRev > 0
                ? (form.avg_monthly_revenue / totalRev) * totalFixedExpenses / unitsSold
                : 0
            realProfit = contributionMargin - fixedExpenseShare
        }

        return { productionCost, totalCost, contributionMargin, realProfit }
    }

    const costs = calculateCosts()

    const resetForm = () => {
        setForm({
            name: '', type: 'manufactured', purchase_cost: 0,
            recipe_yield: 1, sale_price: 0, avg_monthly_revenue: 0,
            ingredients: [], productComponents: [], disabledTaxes: []
        })
        setEditingId(null)
    }

    const handleAddIngredient = () => {
        if (ingredients.length === 0) { alert('Cadastre ingredientes primeiro'); return }
        setForm({ ...form, ingredients: [...form.ingredients, { ingredient_id: ingredients[0].id, quantity: 0 }] })
    }

    const handleAddProductComponent = () => {
        const available = products.filter(p => p.id !== editingId)
        if (available.length === 0) { alert('Nenhum produto disponível'); return }
        setForm({ ...form, productComponents: [...form.productComponents, { child_product_id: available[0].id, quantity: 0 }] })
    }

    const handleRemoveIngredient = (index: number) => {
        setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== index) })
    }

    const handleRemoveProductComponent = (index: number) => {
        setForm({ ...form, productComponents: form.productComponents.filter((_, i) => i !== index) })
    }

    const handleToggleTax = (taxId: string) => {
        if (form.disabledTaxes.includes(taxId)) {
            setForm({ ...form, disabledTaxes: form.disabledTaxes.filter(id => id !== taxId) })
        } else {
            setForm({ ...form, disabledTaxes: [...form.disabledTaxes, taxId] })
        }
    }

    // Upload recipe
    const handleUploadRecipe = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('ingredients', JSON.stringify(ingredients))

            const res = await fetch('/api/profitscan360/extract-recipe', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Set recipe name and yield
            if (data.recipe_name && !form.name) {
                setForm(f => ({ ...f, name: data.recipe_name }))
            }
            if (data.yield) {
                setForm(f => ({ ...f, recipe_yield: data.yield }))
            }

            // Process ingredients
            const newIngredients: ProductIngredient[] = []
            const toCreate: { name: string; quantity: number; unit: string }[] = []

            for (const ext of data.ingredients || []) {
                if (ext.exists) {
                    const found = ingredients.find(i => i.name.toLowerCase() === ext.name.toLowerCase())
                    if (found) {
                        newIngredients.push({ ingredient_id: found.id, quantity: ext.quantity })
                    }
                } else {
                    toCreate.push({ name: ext.name, quantity: ext.quantity, unit: ext.unit })
                }
            }

            // Create missing ingredients (without price)
            for (const ing of toCreate) {
                const { data: created } = await supabase
                    .from('ps360_ingredients')
                    .insert({
                        name: ing.name,
                        type: 'purchased',
                        package_cost: 0,
                        package_quantity: 1,
                        unit: ing.unit || 'g',
                        unit_cost: 0,
                        yield_percentage: 100,
                        user_id: user?.id
                    })
                    .select('id')
                    .single()

                if (created) {
                    newIngredients.push({ ingredient_id: created.id, quantity: ing.quantity })
                }
            }

            // Refresh ingredients list
            await fetchData()

            setForm(f => ({ ...f, ingredients: [...f.ingredients, ...newIngredients] }))

            if (toCreate.length > 0) {
                alert(`${toCreate.length} ingredientes novos foram criados SEM PREÇO. Você precisa definir o custo deles em Ingredientes.`)
            }

        } catch (error) {
            console.error('Erro no upload:', error)
            alert('Erro ao processar a receita')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Duplicate product
    const handleDuplicate = async (product: Product) => {
        // Load product ingredients
        const { data: prodIngredients } = await supabase
            .from('ps360_product_ingredients')
            .select('ingredient_id, quantity')
            .eq('product_id', product.id)

        const { data: prodComponents } = await supabase
            .from('ps360_product_components')
            .select('child_product_id, quantity')
            .eq('parent_product_id', product.id)

        setForm({
            name: `${product.name} (cópia)`,
            type: product.type,
            purchase_cost: product.purchase_cost,
            recipe_yield: product.recipe_yield,
            sale_price: product.sale_price,
            avg_monthly_revenue: 0,
            ingredients: prodIngredients || [],
            productComponents: prodComponents || [],
            disabledTaxes: []
        })
        setEditingId(null)
        setShowForm(true)
    }

    // AI Revenue allocation
    const handleAIRevenue = async () => {
        if (products.length === 0) { alert('Cadastre produtos primeiro'); return }
        if (totalRevenue <= 0) { alert('Informe o faturamento total'); return }

        setAiLoading(true)
        try {
            const res = await fetch('/api/profitscan360/ai-revenue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products, totalRevenue })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Update each product with allocated revenue
            for (const alloc of data.allocations || []) {
                await supabase
                    .from('ps360_products')
                    .update({ avg_monthly_revenue: alloc.revenue })
                    .eq('id', alloc.id)
            }

            // Recalculate all
            await handleRecalculate()
            await fetchData()
            setShowRevenueModal(false)
            alert('Faturamento distribuído com sucesso!')

        } catch (error) {
            console.error('Erro no rateio:', error)
            alert('Erro ao distribuir faturamento')
        } finally {
            setAiLoading(false)
        }
    }

    // Recalculate all products
    const handleRecalculate = async () => {
        setRecalculating(true)
        try {
            await fetch('/api/profitscan360/recalculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id })
            })
            await fetchData()
        } catch (error) {
            console.error('Erro ao recalcular:', error)
        } finally {
            setRecalculating(false)
        }
    }

    const handleSave = async () => {
        if (!form.name.trim()) { alert('Informe o nome do produto'); return }
        setSaving(true)

        const data = {
            name: form.name,
            type: form.type,
            purchase_cost: form.purchase_cost,
            recipe_yield: form.recipe_yield,
            sale_price: form.sale_price,
            avg_monthly_revenue: form.avg_monthly_revenue,
            production_cost: costs.productionCost,
            total_cost: costs.totalCost,
            contribution_margin: costs.contributionMargin,
            real_profit: costs.realProfit,
            user_id: user?.id
        }

        let productId = editingId
        if (editingId) {
            await supabase.from('ps360_products').update(data).eq('id', editingId)
        } else {
            const { data: newProduct } = await supabase.from('ps360_products').insert(data).select('id').single()
            productId = newProduct?.id
        }

        // Save ingredients
        if (productId) {
            await supabase.from('ps360_product_ingredients').delete().eq('product_id', productId)
            if (form.ingredients.length > 0) {
                await supabase.from('ps360_product_ingredients').insert(
                    form.ingredients.map(i => ({ product_id: productId, ingredient_id: i.ingredient_id, quantity: i.quantity }))
                )
            }

            // Save product components
            await supabase.from('ps360_product_components').delete().eq('parent_product_id', productId)
            if (form.productComponents.length > 0) {
                await supabase.from('ps360_product_components').insert(
                    form.productComponents.map(pc => ({ parent_product_id: productId, child_product_id: pc.child_product_id, quantity: pc.quantity }))
                )
            }

            // Save disabled taxes
            await supabase.from('ps360_product_taxes').delete().eq('product_id', productId)
            const globalTaxes = taxes.filter(t => t.is_global)
            if (globalTaxes.length > 0) {
                await supabase.from('ps360_product_taxes').insert(
                    globalTaxes.map(t => ({
                        product_id: productId,
                        tax_id: t.id,
                        is_enabled: !form.disabledTaxes.includes(t.id)
                    }))
                )
            }
        }

        await fetchData()
        resetForm()
        setShowForm(false)
        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este produto?')) return
        await supabase.from('ps360_products').delete().eq('id', id)
        await fetchData()
    }

    const menuItems = [
        { href: '/profitscan360', icon: Home, label: 'Dashboard' },
        { href: '/profitscan360/ingredientes', icon: Package, label: 'Ingredientes' },
        { href: '/profitscan360/taxas', icon: Percent, label: 'Taxas Variáveis' },
        { href: '/profitscan360/despesas', icon: Building2, label: 'Despesas Fixas' },
        { href: '/profitscan360/produtos', icon: ShoppingBag, label: 'Produtos', active: true },
    ]

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>

    const globalTaxes = taxes.filter(t => t.is_global)

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111] border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3">
                        <ArrowLeft className="w-4 h-4" />Voltar ao Hub
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-black" />
                        </div>
                        <div><span className="font-bold text-white">ProfitScan</span><span className="text-orange-400 font-bold"> 360º</span></div>
                    </div>
                </div>
                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.active ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-white/10">
                    <p className="text-sm text-white truncate">{user?.email}</p>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Produtos</h1>
                        <p className="text-gray-400">Produtos fabricados e revendidos com precificação</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRecalculate}
                            disabled={recalculating}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
                            Recalcular
                        </button>
                        <button
                            onClick={() => setShowRevenueModal(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl hover:bg-purple-500/20"
                        >
                            <Sparkles className="w-4 h-4" />
                            Rateio I.A.
                        </button>
                        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90">
                            <Plus className="w-5 h-5" />Novo Produto
                        </button>
                    </div>
                </div>

                {/* AI Revenue Modal */}
                {showRevenueModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-md">
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    Rateio por I.A.
                                </h2>
                                <button onClick={() => setShowRevenueModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                    <p className="text-yellow-400 text-sm">
                                        ⚠️ A I.A. vai distribuir o faturamento proporcionalmente entre seus produtos. Para dados precisos, preencha o faturamento real de cada produto.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Faturamento Total Mensal (R$)</label>
                                    <input
                                        type="number"
                                        value={totalRevenue || ''}
                                        onChange={(e) => setTotalRevenue(parseFloat(e.target.value) || 0)}
                                        placeholder="15000.00"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                                <p className="text-gray-500 text-sm">{products.length} produtos serão atualizados</p>
                            </div>
                            <div className="flex gap-3 p-6 border-t border-white/10">
                                <button onClick={() => setShowRevenueModal(false)} className="flex-1 py-3 px-4 border border-white/10 text-gray-400 font-medium rounded-xl hover:bg-white/5">Cancelar</button>
                                <button onClick={handleAIRevenue} disabled={aiLoading || totalRevenue <= 0} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
                                    {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Distribuir
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
                        <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-3xl my-8">
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
                                <button onClick={() => { setShowForm(false); resetForm() }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
                                {/* Upload de Receita */}
                                {form.type === 'manufactured' && (
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                                        <input type="file" ref={fileInputRef} onChange={handleUploadRecipe} accept="image/*,.pdf" className="hidden" />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                                        >
                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                            {uploading ? 'Processando...' : 'Upload de Receita (Imagem/PDF)'}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1">A I.A. vai extrair os ingredientes automaticamente</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Nome do Produto</label>
                                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Bolo de Chocolate" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'resold' | 'manufactured' })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50">
                                            <option value="manufactured">Fabricado</option>
                                            <option value="resold">Revendido</option>
                                        </select>
                                    </div>
                                </div>

                                {form.type === 'resold' ? (
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Custo de Compra (R$)</label>
                                        <input type="number" value={form.purchase_cost || ''} onChange={(e) => setForm({ ...form, purchase_cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Ingredientes */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm text-gray-400">Ingredientes</label>
                                                <button onClick={handleAddIngredient} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                                                    <Plus className="w-4 h-4" /> Adicionar
                                                </button>
                                            </div>
                                            {form.ingredients.length === 0 ? (
                                                <div className="bg-white/5 rounded-xl p-4 text-center text-gray-500 text-sm">
                                                    Nenhum ingrediente
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {form.ingredients.map((pi, index) => (
                                                        <div key={index} className="flex gap-2 items-center">
                                                            <select value={pi.ingredient_id} onChange={(e) => {
                                                                const newIng = [...form.ingredients]
                                                                newIng[index].ingredient_id = e.target.value
                                                                setForm({ ...form, ingredients: newIng })
                                                            }} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                                                {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                                                            </select>
                                                            <input type="number" value={pi.quantity || ''} onChange={(e) => {
                                                                const newIng = [...form.ingredients]
                                                                newIng[index].quantity = parseFloat(e.target.value) || 0
                                                                setForm({ ...form, ingredients: newIng })
                                                            }} placeholder="Qtd" className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                                                            <button onClick={() => handleRemoveIngredient(index)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Produtos como Ingredientes */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm text-gray-400">Produtos como Ingredientes</label>
                                                <button onClick={handleAddProductComponent} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                                    <Plus className="w-4 h-4" /> Adicionar
                                                </button>
                                            </div>
                                            {form.productComponents.length === 0 ? (
                                                <p className="text-xs text-gray-600">Nenhum produto adicionado como ingrediente</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {form.productComponents.map((pc, index) => (
                                                        <div key={index} className="flex gap-2 items-center">
                                                            <select value={pc.child_product_id} onChange={(e) => {
                                                                const newPC = [...form.productComponents]
                                                                newPC[index].child_product_id = e.target.value
                                                                setForm({ ...form, productComponents: newPC })
                                                            }} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                                                {products.filter(p => p.id !== editingId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                            </select>
                                                            <input type="number" value={pc.quantity || ''} onChange={(e) => {
                                                                const newPC = [...form.productComponents]
                                                                newPC[index].quantity = parseFloat(e.target.value) || 0
                                                                setForm({ ...form, productComponents: newPC })
                                                            }} placeholder="Qtd" className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                                                            <button onClick={() => handleRemoveProductComponent(index)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Rendimento</label>
                                            <input type="number" value={form.recipe_yield || ''} onChange={(e) => setForm({ ...form, recipe_yield: parseFloat(e.target.value) || 1 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Preço de Venda (R$)</label>
                                        <input type="number" value={form.sale_price || ''} onChange={(e) => setForm({ ...form, sale_price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Faturamento Médio Mensal (R$)</label>
                                        <input type="number" value={form.avg_monthly_revenue || ''} onChange={(e) => setForm({ ...form, avg_monthly_revenue: parseFloat(e.target.value) || 0 })} placeholder="Opcional" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600" />
                                    </div>
                                </div>

                                {/* Taxas (com opção de desabilitar) */}
                                {globalTaxes.length > 0 && (
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Taxas Aplicadas</label>
                                        <div className="bg-white/5 rounded-xl p-3 space-y-2">
                                            {globalTaxes.map(tax => (
                                                <label key={tax.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!form.disabledTaxes.includes(tax.id)}
                                                        onChange={() => handleToggleTax(tax.id)}
                                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500"
                                                    />
                                                    <span className={form.disabledTaxes.includes(tax.id) ? 'text-gray-600 line-through' : 'text-gray-300'}>
                                                        {tax.name} ({tax.type === 'percentage' ? `${tax.value}%` : `R$ ${tax.value}`})
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pricing Summary */}
                                {form.sale_price > 0 && (
                                    <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-4 space-y-3">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-orange-400" />
                                            Resumo de Precificação
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="text-gray-400">Custo Produção:</span></div>
                                            <div className="text-right font-semibold text-white">R$ {costs.productionCost.toFixed(2)}</div>

                                            <div><span className="text-gray-400">+ Taxas Variáveis:</span></div>
                                            <div className="text-right font-semibold text-orange-400">R$ {(costs.totalCost - costs.productionCost).toFixed(2)}</div>

                                            <div><span className="text-gray-400">= Custo Total:</span></div>
                                            <div className="text-right font-semibold text-white">R$ {costs.totalCost.toFixed(2)}</div>

                                            <div className="border-t border-white/10 pt-2"><span className="text-gray-400">Margem Contribuição:</span></div>
                                            <div className={`text-right font-bold border-t border-white/10 pt-2 ${costs.contributionMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                R$ {costs.contributionMargin.toFixed(2)} ({((costs.contributionMargin / form.sale_price) * 100).toFixed(1)}%)
                                            </div>
                                        </div>

                                        {form.avg_monthly_revenue > 0 && (
                                            <div className={`mt-3 p-3 rounded-lg ${costs.realProfit >= 0 ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2">
                                                        {costs.realProfit >= 0 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                                                        <span className={costs.realProfit >= 0 ? 'text-green-400' : 'text-red-400'}>Lucro Real:</span>
                                                    </span>
                                                    <span className={`text-xl font-black ${costs.realProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        R$ {costs.realProfit.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 border-t border-white/10">
                                <button onClick={() => { setShowForm(false); resetForm() }} className="flex-1 py-3 px-4 border border-white/10 text-gray-400 font-medium rounded-xl hover:bg-white/5">Cancelar</button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products List */}
                <div className="grid gap-4">
                    {products.length === 0 ? (
                        <div className="bg-[#111] rounded-2xl border border-white/10 p-12 text-center">
                            <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400">Nenhum produto cadastrado</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="bg-[#111] rounded-2xl border border-white/10 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white">{product.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${product.type === 'manufactured' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                                {product.type === 'manufactured' ? 'Fabricado' : 'Revendido'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Custo Total</p>
                                                <p className="text-lg font-semibold text-white">R$ {Number(product.total_cost).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Preço Venda</p>
                                                <p className="text-lg font-semibold text-white">R$ {Number(product.sale_price).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Margem</p>
                                                <p className={`text-lg font-semibold ${Number(product.contribution_margin) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {Number(product.sale_price) > 0 ? ((Number(product.contribution_margin) / Number(product.sale_price)) * 100).toFixed(1) : 0}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Fat. Médio</p>
                                                <p className="text-lg font-semibold text-gray-300">
                                                    {Number(product.avg_monthly_revenue) > 0 ? `R$ ${Number(product.avg_monthly_revenue).toFixed(0)}` : '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Lucro Real</p>
                                                <p className={`text-lg font-bold ${Number(product.real_profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {Number(product.avg_monthly_revenue) > 0 ? `R$ ${Number(product.real_profit).toFixed(2)}` : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleDuplicate(product)} className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg" title="Duplicar">
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg" title="Excluir">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
