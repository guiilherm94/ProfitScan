'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Zap, LogOut, Shield, Settings, Loader2,
    Calculator, Lock, ArrowRight, CheckCircle, Sparkles,
    ShoppingBag, ExternalLink, Target, PieChart
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface ModuleAccess {
    profitscan360: boolean
    profitscanDetector: boolean
    blindagem: boolean
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [access, setAccess] = useState<ModuleAccess>({
        profitscan360: false,
        profitscanDetector: false,
        blindagem: false
    })

    useEffect(() => {
        const checkUserAndAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/'
                return
            }

            // Verificar acesso ao ProfitScan 360º
            const { data: ps360Access } = await supabase
                .from('ps360_access')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single()

            // Verificar acesso ao ProfitScan Detector (tabela existente user_access)
            const { data: detectorAccess } = await supabase
                .from('user_access')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single()

            // Verificar acesso ao Blindagem
            const { data: blindagemAccess } = await supabase
                .from('reputation_access')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single()

            setAccess({
                profitscan360: !!ps360Access,
                profitscanDetector: !!detectorAccess,
                blindagem: !!blindagemAccess
            })

            setUser(session.user)
            setLoading(false)
        }
        checkUserAndAccess()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            </div>
        )
    }

    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <header className="py-4 px-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
                            <Zap className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold text-white">ProfitScan<span className="text-[#00ff88]">AI</span></span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            href="/configuracoes"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Configurações"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                        <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Olá, {userName}! 👋
                    </h1>
                    <p className="text-gray-400">
                        Selecione uma ferramenta para começar
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                    {/* ProfitScan 360º - NOVO e Destaque */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-all md:col-span-2 lg:col-span-1 ${access.profitscan360
                            ? 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30 hover:border-orange-500/50'
                            : 'bg-[#111] border-white/10 hover:border-white/20'
                        }`}>
                        {/* NEW Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="px-2 py-0.5 rounded bg-orange-500 text-black text-[10px] font-bold uppercase">
                                Novo
                            </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            {access.profitscan360 ? (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" />
                                    ATIVO
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                                    <Lock className="w-3 h-3" />
                                    BLOQUEADO
                                </span>
                            )}
                        </div>

                        <div className="p-6 pt-10">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                                <PieChart className="w-7 h-7 text-black" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-white mb-1">
                                ProfitScan 360º
                            </h2>
                            <p className="text-orange-400 text-xs font-semibold mb-3">SISTEMA COMPLETO</p>

                            {/* Description */}
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Precificação completa: ingredientes, fichas técnicas, taxas, despesas fixas e <strong className="text-white">lucro real</strong>.
                            </p>

                            {/* Action */}
                            {access.profitscan360 ? (
                                <Link
                                    href="/profitscan360"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    ACESSAR FERRAMENTA
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <a
                                    href="https://vitrinego.mycartpanda.com/checkout/profitscan360"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    ADQUIRIR POR R$ 47,00
                                </a>
                            )}
                        </div>
                    </div>

                    {/* ProfitScan Detector */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-all ${access.profitscanDetector
                            ? 'bg-gradient-to-br from-[#00ff88]/5 to-[#00d4ff]/5 border-[#00ff88]/30 hover:border-[#00ff88]/50'
                            : 'bg-[#111] border-white/10 hover:border-white/20'
                        }`}>
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            {access.profitscanDetector ? (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" />
                                    ATIVO
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                                    <Lock className="w-3 h-3" />
                                    BLOQUEADO
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                                <Target className="w-7 h-7 text-black" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-white mb-1">
                                ProfitScan Detector
                            </h2>
                            <p className="text-cyan-400 text-xs font-semibold mb-3">ANÁLISE RÁPIDA</p>

                            {/* Description */}
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Calculadora rápida de margem com I.A. Descubra se seu produto dá lucro ou prejuízo.
                            </p>

                            {/* Action */}
                            {access.profitscanDetector ? (
                                <Link
                                    href="/profitscan"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <Calculator className="w-5 h-5" />
                                    ACESSAR FERRAMENTA
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <a
                                    href="https://vitrinego.mycartpanda.com/checkout/204999344:1?tkg=ic"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    ADQUIRIR POR R$ 19,90
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Blindagem Module */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-all ${access.blindagem
                            ? 'bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/30 hover:border-purple-500/50'
                            : 'bg-[#111] border-white/10 hover:border-white/20'
                        }`}>
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            {access.blindagem ? (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" />
                                    ATIVO
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                                    <Lock className="w-3 h-3" />
                                    BLOQUEADO
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                                <Shield className="w-7 h-7 text-white" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-white mb-1">
                                Blindagem de Reputação
                            </h2>
                            <p className="text-purple-400 text-xs font-semibold mb-3">PROTEÇÃO DE MARCA</p>

                            {/* Description */}
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Gere respostas profissionais para avaliações negativas com I.A. Proteja sua reputação.
                            </p>

                            {/* Action */}
                            {access.blindagem ? (
                                <Link
                                    href="/blindagem"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <Shield className="w-5 h-5" />
                                    ACESSAR FERRAMENTA
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <a
                                    href="https://vitrinego.mycartpanda.com/checkout/204999362:1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    ADQUIRIR POR R$ 9,90
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Link
                            href="/configuracoes"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Configurações</p>
                                <p className="text-gray-500 text-sm">Perfil e senha</p>
                            </div>
                        </Link>
                        <a
                            href="https://pedidos.cartpanda.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Gerenciar Compras</p>
                                <p className="text-gray-500 text-sm">Assinaturas e pagamentos</p>
                            </div>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    )
}
