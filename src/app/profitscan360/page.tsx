'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Loader2, Home, Package, Percent, Building2, ShoppingBag,
    ChevronRight, ArrowLeft, Settings, LogOut, PieChart,
    Plus, TrendingUp, AlertTriangle, DollarSign
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface DashboardStats {
    totalProducts: number
    totalIngredients: number
    totalFixedExpenses: number
    avgMargin: number
}

export default function ProfitScan360Page() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalIngredients: 0,
        totalFixedExpenses: 0,
        avgMargin: 0
    })

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/'
                return
            }

            // Verificar acesso ao módulo
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

            // Carregar estatísticas
            const [ingredients, products, expenses] = await Promise.all([
                supabase.from('ps360_ingredients').select('id', { count: 'exact' }).eq('user_id', session.user.id),
                supabase.from('ps360_products').select('id, contribution_margin', { count: 'exact' }).eq('user_id', session.user.id),
                supabase.from('ps360_fixed_expenses').select('value').eq('user_id', session.user.id)
            ])

            const totalExpenses = expenses.data?.reduce((sum, e) => sum + Number(e.value), 0) || 0
            const margins = products.data?.map(p => Number(p.contribution_margin)) || []
            const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0

            setStats({
                totalIngredients: ingredients.count || 0,
                totalProducts: products.count || 0,
                totalFixedExpenses: totalExpenses,
                avgMargin: avgMargin
            })

            setUser(session.user)
            setLoading(false)
        }
        init()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    const menuItems = [
        { href: '/profitscan360', icon: Home, label: 'Dashboard', active: true },
        { href: '/profitscan360/ingredientes', icon: Package, label: 'Ingredientes' },
        { href: '/profitscan360/taxas', icon: Percent, label: 'Taxas Variáveis' },
        { href: '/profitscan360/despesas', icon: Building2, label: 'Despesas Fixas' },
        { href: '/profitscan360/produtos', icon: ShoppingBag, label: 'Produtos' },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111] border-r border-white/10 flex flex-col">
                {/* Logo */}
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

                {/* Navigation */}
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
                                    {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User */}
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Visão geral do seu negócio
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#111] rounded-2xl border border-white/10 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-orange-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Produtos</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
                    </div>

                    <div className="bg-[#111] rounded-2xl border border-white/10 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Ingredientes</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalIngredients}</p>
                    </div>

                    <div className="bg-[#111] rounded-2xl border border-white/10 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Despesas Fixas</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            R$ {stats.totalFixedExpenses.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-[#111] rounded-2xl border border-white/10 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.avgMargin >= 20 ? 'bg-green-500/10' : stats.avgMargin >= 10 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                                }`}>
                                <TrendingUp className={`w-5 h-5 ${stats.avgMargin >= 20 ? 'text-green-400' : stats.avgMargin >= 10 ? 'text-yellow-400' : 'text-red-400'
                                    }`} />
                            </div>
                            <span className="text-gray-400 text-sm">Margem Média</span>
                        </div>
                        <p className={`text-3xl font-bold ${stats.avgMargin >= 20 ? 'text-green-400' : stats.avgMargin >= 10 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {stats.avgMargin.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Comece aqui</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/profitscan360/ingredientes?new=true"
                            className="flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                        >
                            <Plus className="w-5 h-5 text-cyan-400" />
                            <span className="text-white font-medium">Novo Ingrediente</span>
                        </Link>
                        <Link
                            href="/profitscan360/taxas?new=true"
                            className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
                        >
                            <Plus className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-medium">Nova Taxa</span>
                        </Link>
                        <Link
                            href="/profitscan360/despesas?new=true"
                            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                        >
                            <Plus className="w-5 h-5 text-red-400" />
                            <span className="text-white font-medium">Nova Despesa</span>
                        </Link>
                        <Link
                            href="/profitscan360/produtos?new=true"
                            className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
                        >
                            <Plus className="w-5 h-5 text-orange-400" />
                            <span className="text-white font-medium">Novo Produto</span>
                        </Link>
                    </div>
                </div>

                {/* Empty State */}
                {stats.totalProducts === 0 && stats.totalIngredients === 0 && (
                    <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-2xl border border-orange-500/30 p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Nenhum dado cadastrado ainda
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Comece cadastrando seus ingredientes e matérias-primas. Depois, crie seus produtos com fichas técnicas para calcular o lucro real.
                        </p>
                        <Link
                            href="/profitscan360/ingredientes?new=true"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90"
                        >
                            <Package className="w-5 h-5" />
                            Cadastrar Primeiro Ingrediente
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
