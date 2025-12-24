'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Loader2, Home, Package, Percent, Building2, ShoppingBag,
    ChevronRight, ArrowLeft, Settings, PieChart, Plus, Trash2,
    Edit2, X, Save, Search
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'


interface Ingredient {
    id: string
    name: string
    type: 'purchased' | 'manufactured'
    package_cost: number
    package_quantity: number
    unit: string
    unit_cost: number
    yield_percentage: number
    notes: string | null
}

interface Unit {
    id: string
    user_id: string | null
    symbol: string
    name: string
    is_global: boolean
}

export default function IngredientesPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [units, setUnits] = useState<Unit[]>([])
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [showNewUnitModal, setShowNewUnitModal] = useState(false)
    const [newUnitSymbol, setNewUnitSymbol] = useState('')
    const [newUnitName, setNewUnitName] = useState('')

    // Form state
    const [form, setForm] = useState({
        name: '',
        type: 'purchased' as 'purchased' | 'manufactured',
        package_cost: 0,
        package_quantity: 1,
        unit: 'kg',
        yield_percentage: 100,
        notes: ''
    })

    const fetchIngredients = useCallback(async () => {
        const { data } = await supabase
            .from('ps360_ingredients')
            .select('*')
            .order('name')
        setIngredients(data || [])
    }, [])

    const fetchUnits = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`/api/profitscan360/units?user_id=${userId}`)
            const data = await res.json()
            if (Array.isArray(data)) setUnits(data)
        } catch (error) {
            console.error('Erro ao buscar unidades:', error)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/'
                return
            }

            const { data: access } = await supabase
                .from('ps360_access')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single()

            if (!access) {
                window.location.href = '/dashboard'
                return
            }

            // Verificar se o acesso expirou
            if (access.expires_at) {
                const expiresAt = new Date(access.expires_at)
                if (expiresAt < new Date()) {
                    window.location.href = '/profitscan360/expirado'
                    return
                }
            }

            setUser(session.user)
            await fetchIngredients()
            await fetchUnits(session.user.id)
            setLoading(false)
        }
        init()
    }, [fetchIngredients])

    const resetForm = () => {
        setForm({
            name: '',
            type: 'purchased',
            package_cost: 0,
            package_quantity: 1,
            unit: 'kg',
            yield_percentage: 100,
            notes: ''
        })
        setEditingId(null)
    }

    const handleEdit = (ingredient: Ingredient) => {
        setForm({
            name: ingredient.name,
            type: ingredient.type,
            package_cost: ingredient.package_cost,
            package_quantity: ingredient.package_quantity,
            unit: ingredient.unit,
            yield_percentage: ingredient.yield_percentage,
            notes: ingredient.notes || ''
        })
        setEditingId(ingredient.id)
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) {
            alert('Informe o nome do ingrediente')
            return
        }

        setSaving(true)
        const unit_cost = form.package_quantity > 0
            ? form.package_cost / form.package_quantity
            : 0

        const data = {
            name: form.name,
            type: form.type,
            package_cost: form.package_cost,
            package_quantity: form.package_quantity,
            unit: form.unit,
            unit_cost: unit_cost,
            yield_percentage: form.yield_percentage,
            notes: form.notes || null,
            user_id: user?.id
        }

        if (editingId) {
            await supabase.from('ps360_ingredients').update(data).eq('id', editingId)
        } else {
            await supabase.from('ps360_ingredients').insert(data)
        }

        // Recalcular todos os produtos quando ingrediente é modificado
        if (editingId) {
            await fetch('/api/profitscan360/recalculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id, ingredient_id: editingId })
            })
        }

        await fetchIngredients()
        resetForm()
        setShowForm(false)
        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return
        await supabase.from('ps360_ingredients').delete().eq('id', id)
        await fetchIngredients()
    }

    const handleCreateUnit = async () => {
        if (!newUnitSymbol.trim() || !newUnitName.trim()) {
            alert('Preencha símbolo e nome da unidade')
            return
        }
        if (!user) return

        try {
            const res = await fetch('/api/profitscan360/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    symbol: newUnitSymbol.trim(),
                    name: newUnitName.trim()
                })
            })

            if (res.ok) {
                await fetchUnits(user.id)
                setNewUnitSymbol('')
                setNewUnitName('')
                setShowNewUnitModal(false)
                setForm({ ...form, unit: newUnitSymbol.trim() })
            } else {
                const data = await res.json()
                alert(data.error || 'Erro ao criar unidade')
            }
        } catch (error) {
            console.error('Erro ao criar unidade:', error)
            alert('Erro ao criar unidade')
        }
    }

    const filteredIngredients = ingredients.filter((i: Ingredient) =>
        i.name.toLowerCase().includes(search.toLowerCase())
    )

    const menuItems = [
        { href: '/profitscan360', icon: Home, label: 'Dashboard' },
        { href: '/profitscan360/ingredientes', icon: Package, label: 'Ingredientes', active: true },
        { href: '/profitscan360/taxas', icon: Percent, label: 'Taxas Variáveis' },
        { href: '/profitscan360/despesas', icon: Building2, label: 'Despesas Fixas' },
        { href: '/profitscan360/produtos', icon: ShoppingBag, label: 'Produtos' },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111] border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Hub
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <span className="font-bold text-white">ProfitScan</span>
                            <span className="text-orange-400 font-bold"> 360º</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.active
                                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{user?.email}</p>
                        </div>
                        <Link href="/configuracoes" className="p-2 text-gray-400 hover:text-white">
                            <Settings className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Ingredientes</h1>
                        <p className="text-gray-400">Matérias-primas e receitas base</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Ingrediente
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar ingrediente..."
                        className="w-full pl-12 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                    />
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-lg">
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">
                                    {editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
                                </h2>
                                <button onClick={() => { setShowForm(false); resetForm() }} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Nome</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: Farinha de Trigo"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as 'purchased' | 'manufactured' })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                    >
                                        <option value="purchased">Comprado</option>
                                        <option value="manufactured">Fabricado (Receita)</option>
                                    </select>
                                </div>

                                {form.type === 'purchased' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Custo do Pacote (R$)</label>
                                                <input
                                                    type="number"
                                                    value={form.package_cost || ''}
                                                    onChange={(e) => setForm({ ...form, package_cost: parseFloat(e.target.value) || 0 })}
                                                    placeholder="25.00"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Qtd. no Pacote</label>
                                                <input
                                                    type="number"
                                                    value={form.package_quantity || ''}
                                                    onChange={(e) => setForm({ ...form, package_quantity: parseFloat(e.target.value) || 1 })}
                                                    placeholder="5"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm text-gray-400">Unidade</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewUnitModal(true)}
                                                        className="text-xs text-orange-400 hover:text-orange-300"
                                                    >
                                                        + Nova
                                                    </button>
                                                </div>
                                                <select
                                                    value={form.unit}
                                                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                                >
                                                    {units.map(u => (
                                                        <option key={u.id} value={u.symbol} className="bg-gray-900 text-white">
                                                            {u.name} ({u.symbol})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Aproveitamento (%)</label>
                                                <input
                                                    type="number"
                                                    value={form.yield_percentage || ''}
                                                    onChange={(e) => setForm({ ...form, yield_percentage: parseFloat(e.target.value) || 100 })}
                                                    placeholder="100"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Observações</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Notas adicionais..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                                    />
                                </div>

                                {form.type === 'purchased' && form.package_quantity > 0 && (
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                        <p className="text-sm text-gray-400">Custo por unidade:</p>
                                        <p className="text-2xl font-bold text-orange-400">
                                            R$ {(form.package_cost / form.package_quantity).toFixed(4)} / {form.unit}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 border-t border-white/10">
                                <button
                                    onClick={() => { setShowForm(false); resetForm() }}
                                    className="flex-1 py-3 px-4 border border-white/10 text-gray-400 font-medium rounded-xl hover:bg-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ingredients List */}
                <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
                    {filteredIngredients.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400">Nenhum ingrediente cadastrado</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Nome</th>
                                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Tipo</th>
                                    <th className="text-right text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Custo Unitário</th>
                                    <th className="text-right text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredIngredients.map((ingredient) => (
                                    <tr key={ingredient.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">{ingredient.name}</p>
                                            {ingredient.notes && (
                                                <p className="text-xs text-gray-500 mt-1">{ingredient.notes}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${ingredient.type === 'purchased'
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {ingredient.type === 'purchased' ? 'Comprado' : 'Fabricado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-semibold text-white">
                                                R$ {Number(ingredient.unit_cost).toFixed(4)}
                                            </p>
                                            <p className="text-xs text-gray-500">por {ingredient.unit}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(ingredient)}
                                                    className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ingredient.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Modal Nova Unidade */}
            {showNewUnitModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Nova Unidade</h2>
                            <button
                                onClick={() => setShowNewUnitModal(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Símbolo (ex: kg, un)</label>
                                <input
                                    type="text"
                                    value={newUnitSymbol}
                                    onChange={(e) => setNewUnitSymbol(e.target.value)}
                                    placeholder="kg"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome (ex: Quilograma)</label>
                                <input
                                    type="text"
                                    value={newUnitName}
                                    onChange={(e) => setNewUnitName(e.target.value)}
                                    placeholder="Quilograma"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <button
                                onClick={handleCreateUnit}
                                className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl text-white font-semibold hover:from-orange-500 hover:to-orange-400 transition-all"
                            >
                                Criar Unidade
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
