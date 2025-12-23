'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Loader2, Home, Package, Percent, Building2, ShoppingBag,
    ArrowLeft, Settings, PieChart, Plus, Trash2,
    Edit2, X, Save, Search
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Tax {
    id: string
    name: string
    type: 'percentage' | 'fixed'
    value: number
    is_global: boolean
    description: string | null
}

export default function TaxasPage() {
    const searchParams = useSearchParams()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [taxes, setTaxes] = useState<Tax[]>([])
    const [showForm, setShowForm] = useState(searchParams.get('new') === 'true')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        name: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: 0,
        is_global: true,
        description: ''
    })

    const fetchTaxes = useCallback(async () => {
        const { data } = await supabase.from('ps360_taxes').select('*').order('name')
        setTaxes(data || [])
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
            await fetchTaxes()
            setLoading(false)
        }
        init()
    }, [fetchTaxes])

    const resetForm = () => {
        setForm({ name: '', type: 'percentage', value: 0, is_global: true, description: '' })
        setEditingId(null)
    }

    const handleEdit = (tax: Tax) => {
        setForm({
            name: tax.name,
            type: tax.type,
            value: tax.value,
            is_global: tax.is_global,
            description: tax.description || ''
        })
        setEditingId(tax.id)
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { alert('Informe o nome da taxa'); return }
        setSaving(true)

        const data = { ...form, description: form.description || null, user_id: user?.id }
        if (editingId) {
            await supabase.from('ps360_taxes').update(data).eq('id', editingId)
        } else {
            await supabase.from('ps360_taxes').insert(data)
        }

        await fetchTaxes()
        resetForm()
        setShowForm(false)
        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta taxa?')) return
        await supabase.from('ps360_taxes').delete().eq('id', id)
        await fetchTaxes()
    }

    const menuItems = [
        { href: '/profitscan360', icon: Home, label: 'Dashboard' },
        { href: '/profitscan360/ingredientes', icon: Package, label: 'Ingredientes' },
        { href: '/profitscan360/taxas', icon: Percent, label: 'Taxas Variáveis', active: true },
        { href: '/profitscan360/despesas', icon: Building2, label: 'Despesas Fixas' },
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
                        <h1 className="text-2xl font-bold text-white">Taxas Variáveis</h1>
                        <p className="text-gray-400">Custos que variam por produto (cartão, embalagem, imposto)</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90">
                        <Plus className="w-5 h-5" />Nova Taxa
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-lg">
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Taxa' : 'Nova Taxa'}</h2>
                                <button onClick={() => { setShowForm(false); resetForm() }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Nome</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Taxa do Cartão" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50">
                                            <option value="percentage">Percentual (%)</option>
                                            <option value="fixed">Valor Fixo (R$)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Valor</label>
                                        <input type="number" value={form.value || ''} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} placeholder={form.type === 'percentage' ? '3.5' : '1.50'} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="is_global" checked={form.is_global} onChange={(e) => setForm({ ...form, is_global: e.target.checked })} className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500" />
                                    <label htmlFor="is_global" className="text-gray-300">Aplicar em TODOS os produtos automaticamente</label>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                                    <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opcional" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
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
                    {taxes.length === 0 ? (
                        <div className="p-12 text-center">
                            <Percent className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400">Nenhuma taxa cadastrada</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Nome</th>
                                    <th className="text-left text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Tipo</th>
                                    <th className="text-right text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Valor</th>
                                    <th className="text-center text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Global</th>
                                    <th className="text-right text-xs text-gray-400 uppercase tracking-wider px-6 py-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {taxes.map((tax) => (
                                    <tr key={tax.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4"><p className="font-medium text-white">{tax.name}</p>{tax.description && <p className="text-xs text-gray-500">{tax.description}</p>}</td>
                                        <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${tax.type === 'percentage' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{tax.type === 'percentage' ? 'Percentual' : 'Fixo'}</span></td>
                                        <td className="px-6 py-4 text-right font-semibold text-white">{tax.type === 'percentage' ? `${tax.value}%` : `R$ ${Number(tax.value).toFixed(2)}`}</td>
                                        <td className="px-6 py-4 text-center">{tax.is_global ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(tax)} className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(tax.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
