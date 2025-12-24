'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    Users,
    BarChart3,
    Settings,
    Cpu,
    DollarSign,
    Activity,
    Plus,
    Trash2,
    Shield,
    ShieldOff,
    RefreshCw,
    Search,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
    users: { total: number; activeSubscribers: number }
    scans: { total: number; monthly: number }
    costs: { perScan: number; monthlyEstimate: number; totalEstimate: number }
    revenue: { total: number; monthly: number; ordersThisMonth: number }
}

interface User {
    id: string
    email: string
    name: string
    created_at: string
    ps360_access: Array<{
        is_active: boolean
        expires_at: string
        ai_scans_used: number
    }>
}

interface AISettings {
    currentProvider: string
    fallbackEnabled: boolean
    availableProviders: Array<{
        id: string
        name: string
        inputCost: number
        outputCost: number
        description?: string
    }>
}

// Criar cliente Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'settings'>('dashboard')

    // States
    const [stats, setStats] = useState<Stats | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [usersPagination, setUsersPagination] = useState({ page: 1, total: 0, totalPages: 0 })
    const [searchQuery, setSearchQuery] = useState('')
    const [aiSettings, setAISettings] = useState<AISettings | null>(null)

    // Modals
    const [showCreateUser, setShowCreateUser] = useState(false)
    const [newUser, setNewUser] = useState({ email: '', password: '', name: '', grantPS360Access: true })

    useEffect(() => {
        checkAdmin()
    }, [])

    async function checkAdmin() {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user?.email) {
            window.location.href = '/login'
            return
        }

        // Verificar se é admin no Supabase (coluna is_admin na tabela profiles)
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()

        if (!profile?.is_admin) {
            window.location.href = '/dashboard'
            return
        }

        setIsAdmin(true)
        await loadData()
        setLoading(false)
    }

    async function loadData() {
        await Promise.all([
            fetchStats(),
            fetchUsers(),
            fetchAISettings()
        ])
    }

    async function fetchStats() {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
            const data = await res.json()
            setStats(data)
        }
    }

    async function fetchUsers(page = 1) {
        const res = await fetch(`/api/admin/users?page=${page}&limit=10&search=${searchQuery}`)
        if (res.ok) {
            const data = await res.json()
            setUsers(data.users)
            setUsersPagination(data.pagination)
        }
    }

    async function fetchAISettings() {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
            const data = await res.json()
            setAISettings(data)
        }
    }

    async function createUser() {
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        })

        if (res.ok) {
            setShowCreateUser(false)
            setNewUser({ email: '', password: '', name: '', grantPS360Access: true })
            fetchUsers()
            fetchStats()
        }
    }

    async function deleteUser(userId: string) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return

        await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        })

        fetchUsers()
        fetchStats()
    }

    async function updateUserAccess(userId: string, email: string, action: 'grant_access' | 'revoke_access' | 'reset_scans') {
        await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, email, action })
        })

        fetchUsers()
    }

    async function updateAIProvider(provider: string) {
        // Update local state immediately for UI feedback
        if (aiSettings) {
            setAISettings({ ...aiSettings, currentProvider: provider })
        }

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentProvider: provider })
            })

            if (res.ok) {
                console.log('Provider alterado para:', provider)
            } else {
                console.error('Erro ao alterar provider')
                // Revert on error
                fetchAISettings()
            }
        } catch (error) {
            console.error('Erro:', error)
            fetchAISettings()
        }
    }

    async function toggleFallback() {
        if (!aiSettings) return

        const newValue = !aiSettings.fallbackEnabled

        // Update local state immediately
        setAISettings({ ...aiSettings, fallbackEnabled: newValue })

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fallbackEnabled: newValue })
            })

            if (res.ok) {
                console.log('Fallback alterado para:', newValue)
            } else {
                console.error('Erro ao alterar fallback')
                fetchAISettings()
            }
        } catch (error) {
            console.error('Erro:', error)
            fetchAISettings()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if (!isAdmin) return null

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="bg-[#111] border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">Painel Administrativo</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-300'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'users' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-300'}`}
                        >
                            <Users className="w-4 h-4" />
                            Usuários
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'settings' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-300'}`}
                        >
                            <Settings className="w-4 h-4" />
                            Configurações
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <div className="space-y-6">
                        {/* Cards de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span className="text-gray-400">Total Usuários</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.users.total}</p>
                                <p className="text-sm text-green-500">{stats.users.activeSubscribers} assinantes ativos</p>
                            </div>

                            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-5 h-5 text-purple-500" />
                                    <span className="text-gray-400">Scans IA</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.scans.monthly}</p>
                                <p className="text-sm text-gray-500">{stats.scans.total} total</p>
                            </div>

                            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Cpu className="w-5 h-5 text-orange-500" />
                                    <span className="text-gray-400">Custo IA (Mês)</span>
                                </div>
                                <p className="text-3xl font-bold">
                                    ${stats.costs.monthlyEstimate.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">${stats.costs.perScan.toFixed(4)}/scan</p>
                            </div>

                            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-400">Faturamento (Mês)</span>
                                </div>
                                <p className="text-3xl font-bold">
                                    R$ {stats.revenue.monthly.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">{stats.revenue.ordersThisMonth} pedidos</p>
                            </div>
                        </div>

                        {/* Resumo */}
                        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Resumo Financeiro</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Faturamento Total</p>
                                    <p className="text-xl font-bold text-green-500">R$ {stats.revenue.total.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Custo Total IA</p>
                                    <p className="text-xl font-bold text-red-500">${stats.costs.totalEstimate.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Margem Estimada</p>
                                    <p className="text-xl font-bold text-blue-500">
                                        {((1 - (stats.costs.monthlyEstimate * 5) / stats.revenue.monthly) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Scans/Usuário</p>
                                    <p className="text-xl font-bold">
                                        {stats.users.activeSubscribers > 0
                                            ? (stats.scans.monthly / stats.users.activeSubscribers).toFixed(1)
                                            : '0'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        {/* Barra de ações */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuário..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                        className="bg-[#111] border border-gray-800 rounded-lg pl-10 pr-4 py-2 w-64"
                                    />
                                </div>
                                <button
                                    onClick={() => fetchUsers()}
                                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={() => setShowCreateUser(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600"
                            >
                                <Plus className="w-4 h-4" />
                                Criar Usuário
                            </button>
                        </div>

                        {/* Tabela de usuários */}
                        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm text-gray-400">Usuário</th>
                                        <th className="text-left px-4 py-3 text-sm text-gray-400">Status PS360</th>
                                        <th className="text-left px-4 py-3 text-sm text-gray-400">Scans Usados</th>
                                        <th className="text-left px-4 py-3 text-sm text-gray-400">Expira em</th>
                                        <th className="text-right px-4 py-3 text-sm text-gray-400">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        const access = user.ps360_access?.[0]
                                        return (
                                            <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{user.name || user.email.split('@')[0]}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {access?.is_active ? (
                                                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                                                            Ativo
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full">
                                                            Inativo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-300">
                                                    {access?.ai_scans_used || 0}/50
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 text-sm">
                                                    {access?.expires_at
                                                        ? new Date(access.expires_at).toLocaleDateString('pt-BR')
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {access?.is_active ? (
                                                            <button
                                                                onClick={() => updateUserAccess(user.id, user.email, 'revoke_access')}
                                                                className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                                                                title="Revogar acesso"
                                                            >
                                                                <ShieldOff className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => updateUserAccess(user.id, user.email, 'grant_access')}
                                                                className="p-2 text-green-500 hover:bg-green-500/20 rounded-lg"
                                                                title="Liberar acesso"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => updateUserAccess(user.id, user.email, 'reset_scans')}
                                                            className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg"
                                                            title="Resetar scans"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                                                            title="Excluir usuário"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {/* Paginação */}
                            {usersPagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-800">
                                    {Array.from({ length: usersPagination.totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => fetchUsers(i + 1)}
                                            className={`w-8 h-8 rounded ${usersPagination.page === i + 1
                                                ? 'bg-orange-500 text-black'
                                                : 'bg-gray-800 text-gray-400'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Criar Usuário */}
                        {showCreateUser && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                                <div className="bg-[#111] border border-gray-800 rounded-xl p-6 w-full max-w-md">
                                    <h2 className="text-xl font-bold mb-4">Criar Usuário</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={newUser.email}
                                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Senha</label>
                                            <input
                                                type="password"
                                                value={newUser.password}
                                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Nome</label>
                                            <input
                                                type="text"
                                                value={newUser.name}
                                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newUser.grantPS360Access}
                                                onChange={e => setNewUser({ ...newUser, grantPS360Access: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Liberar acesso ao ProfitScan 360º</span>
                                        </label>
                                    </div>
                                    <div className="flex gap-2 mt-6">
                                        <button
                                            onClick={() => setShowCreateUser(false)}
                                            className="flex-1 px-4 py-2 bg-gray-800 rounded-lg"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={createUser}
                                            className="flex-1 px-4 py-2 bg-orange-500 text-black font-semibold rounded-lg"
                                        >
                                            Criar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && aiSettings && (
                    <div className="max-w-2xl space-y-6">
                        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-orange-500" />
                                Provedor de IA
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">
                                Selecione qual IA será usada para processar imagens e textos.
                            </p>

                            <div className="space-y-3">
                                {aiSettings.availableProviders.map(provider => (
                                    <div
                                        key={provider.id}
                                        onClick={() => updateAIProvider(provider.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${aiSettings.currentProvider === provider.id
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-gray-800 hover:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="ai-provider"
                                                checked={aiSettings.currentProvider === provider.id}
                                                onChange={() => updateAIProvider(provider.id)}
                                                className="w-4 h-4 text-orange-500"
                                            />
                                            <div>
                                                <p className="font-medium">{provider.name}</p>
                                                <p className="text-sm text-gray-500">{provider.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">
                                                ${provider.inputCost}/1M input
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                ${provider.outputCost}/1M output
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Configurações de Fallback</h2>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={aiSettings.fallbackEnabled}
                                    onChange={() => toggleFallback()}
                                    className="rounded w-4 h-4"
                                />
                                <span>Habilitar fallback automático se a IA principal falhar</span>
                            </label>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
