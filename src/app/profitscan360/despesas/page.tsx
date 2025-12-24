'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Loader2, Home, Package, Percent, Building2, ShoppingBag,
    ArrowLeft, Settings, PieChart, Plus, Trash2,
    Edit2, X, Save
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface Expense {
    id: string
    name: string
    value: number
    recurrence: string
    notes: string | null
}

export default function DespesasPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        name: '',
        value: 0,
        recurrence: 'monthly',
        notes: ''
    })

    const fetchExpenses = useCallback(async () => {
        const { data } = await supabase.from('ps360_fixed_expenses').select('*').order('name')
        setExpenses(data || [])
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

            // Verificar se o acesso expirou
            if (access.expires_at) {
                const expiresAt = new Date(access.expires_at)
                if (expiresAt < new Date()) {
                    window.location.href = '/profitscan360/expirado'
                    return
                }
            }

            setUser(session.user)
            await fetchExpenses()
            setLoading(false)
        }
        init()
    }, [fetchExpenses])

    const resetForm = () => {
        setForm({ name: '', value: 0, recurrence: 'monthly', notes: '' })
        setEditingId(null)
    }

    const handleEdit = (expense: Expense) => {
        setForm({
            name: expense.name,
            value: expense.value,
            recurrence: expense.recurrence,
            notes: expense.notes || ''
        })
        setEditingId(expense.id)
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { alert('Informe o nome da despesa'); return }
        setSaving(true)

        const data = { ...form, notes: form.notes || null, user_id: user?.id }
        if (editingId) {
            await supabase.from('ps360_fixed_expenses').update(data).eq('id', editingId)
        } else {
            await supabase.from('ps360_fixed_expenses').insert(data)
        }

        await fetchExpenses()
        resetForm()
        setShowForm(false)
        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta despesa?')) return
        await supabase.from('ps360_fixed_expenses').delete().eq('id', id)
        await fetchExpenses()
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.value), 0)

    const menuItems = [
        { href: '/profitscan360', icon: Home, label: 'Dashboard' },
        { href: '/profitscan360/ingredientes', icon: Package, label: 'Ingredientes' },
        { href: '/profitscan360/taxas', icon: Percent, label: 'Taxas Variáveis' },
        { href: '/profitscan360/despesas', icon: Building2, label: 'Despesas Fixas', active: true },
        { href: '/profitscan360/produtos', icon: ShoppingBag, label: 'Produtos' },
    ]

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>

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
                    <div className="flex items-center gap-3">
                        <p className="flex-1 text-sm text-white truncate">{user?.email}</p>
                        <Link href="/configuracoes" className="p-2 text-gray-400 hover:text-white"><Settings className="w-4 h-4" /></Link>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Despesas Fixas</h1>
                        <p className="text-gray-400">Custos mensais do negócio (aluguel, luz, salários)</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90">
                        <Plus className="w-5 h-5" />Nova Despesa
                    </button>
                </div>

                {/* Total */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
                    <p className="text-red-400 text-sm mb-1">Total de Despesas Fixas Mensais</p>
                    <p className="text-4xl font-black text-white">R$ {totalExpenses.toFixed(2)}</p>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-lg">
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Despesa' : 'Nova Despesa'}</h2>
                                <button onClick={() => { setShowForm(false); resetForm() }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Nome</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Aluguel" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Valor (R$)</label>
                                        <input type="number" value={form.value || ''} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} placeholder="1500.00" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Recorrência</label>
                                        <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50">
                                            <option value="monthly">Mensal</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="daily">Diário</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Observações</label>
                                    <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                                </div>
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

                {/* List */}
                <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
                    {expenses.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400">Nenhuma despesa cadastrada</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Nome</th>
                                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Recorrência</th>
                                    <th className="text-right text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Valor</th>
                                    <th className="text-right text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4"><p className="font-medium text-white">{expense.name}</p>{expense.notes && <p className="text-xs text-gray-500">{expense.notes}</p>}</td>
                                        <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 capitalize">{expense.recurrence === 'monthly' ? 'Mensal' : expense.recurrence === 'weekly' ? 'Semanal' : 'Diário'}</span></td>
                                        <td className="px-6 py-4 text-right font-semibold text-red-400">R$ {Number(expense.value).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(expense)} className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(expense.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    )
}
