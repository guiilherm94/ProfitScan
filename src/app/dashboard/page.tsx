'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, type HistoryEntry } from '@/lib/supabase'
import { calculateProfit, formatCurrency, formatPercentage, type ProductData } from '@/utils/calculations'
import {
    Zap, LogOut, Calculator, Bot, History, Loader2,
    TrendingUp, TrendingDown, AlertTriangle, Sparkles,
    ChevronRight, Trash2, Shield, Settings, CheckCircle
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

// Set to false to require paid access, true to bypass access check
const BYPASS_ACCESS_CHECK = true

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState<string | null>(null)
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [historyLoading, setHistoryLoading] = useState(true)

    // Form state
    const [productData, setProductData] = useState<ProductData>({
        nome: '',
        custoProducao: 0,
        precoVenda: 0,
        custosFixos: 15
    })

    // Calculate results in real-time
    const result = calculateProfit(productData)

    // Check auth and access
    useEffect(() => {
        const checkUserAndAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/'
                return
            }

            // Verificar acesso pago (se não estiver em bypass)
            if (!BYPASS_ACCESS_CHECK) {
                try {
                    const response = await fetch(`/api/check-access?email=${encodeURIComponent(session.user.email || '')}`)
                    const data = await response.json()

                    if (!data.hasAccess) {
                        window.location.href = '/acesso-bloqueado'
                        return
                    }
                } catch (error) {
                    console.error('Erro ao verificar acesso:', error)
                    // Em caso de erro, permite acesso (fail open)
                }
            }

            setUser(session.user)
            setLoading(false)
        }
        checkUserAndAccess()
    }, [])


    // Fetch history - defined as useCallback
    const fetchHistory = useCallback(async () => {
        if (!user) return
        try {
            const { data, error } = await supabase
                .from('history')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error
            setHistory(data || [])
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setHistoryLoading(false)
        }
    }, [user])

    // Fetch history on mount
    useEffect(() => {
        if (user) {
            fetchHistory()
        }
    }, [user, fetchHistory])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const handleAnalyze = async () => {
        if (!productData.nome || productData.precoVenda <= 0) {
            alert('Preencha o nome do produto e o preço de venda')
            return
        }

        setAiLoading(true)
        setAiResponse(null)

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    produto: productData.nome,
                    custoProducao: productData.custoProducao,
                    precoVenda: productData.precoVenda,
                    custosFixos: productData.custosFixos,
                    margem: result.margem,
                    lucro: result.lucroLiquido,
                    isPrejuizo: result.isPrejuizo
                })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            setAiResponse(data.analysis)
            fetchHistory() // Refresh history
        } catch (error) {
            console.error('Error:', error)
            setAiResponse('Erro ao consultar a I.A. Tente novamente.')
        } finally {
            setAiLoading(false)
        }
    }

    const handleDeleteHistory = async (id: string) => {
        try {
            await supabase.from('history').delete().eq('id', id)
            setHistory(history.filter(h => h.id !== id))
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <header className="py-4 px-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
                            <Zap className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold text-white">ProfitScan<span className="text-[#00ff88]">AI</span></span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            href="/blindagem"
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-medium transition-colors"
                        >
                            <Shield className="w-4 h-4" />
                            Blindagem
                        </Link>
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

            <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Calculator Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Input Card */}
                        <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
                                    <Calculator className="w-5 h-5 text-[#00d4ff]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Calculadora de Lucro</h2>
                                    <p className="text-sm text-gray-500">Insira os dados do seu produto</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2">Nome do Produto</label>
                                    <input
                                        type="text"
                                        value={productData.nome}
                                        onChange={(e) => setProductData({ ...productData, nome: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all"
                                        placeholder="Ex: Coxinha, Brigadeiro, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Custo de Produção (R$)</label>
                                    <input
                                        type="number"
                                        value={productData.custoProducao || ''}
                                        onChange={(e) => setProductData({ ...productData, custoProducao: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Preço de Venda (R$)</label>
                                    <input
                                        type="number"
                                        value={productData.precoVenda || ''}
                                        onChange={(e) => setProductData({ ...productData, precoVenda: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm text-gray-400">Custos Fixos/Impostos</label>
                                        <span className="text-sm font-semibold text-[#00d4ff]">{productData.custosFixos}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        value={productData.custosFixos}
                                        onChange={(e) => setProductData({ ...productData, custosFixos: parseFloat(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                                        min="0"
                                        max="50"
                                        step="1"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>0%</span>
                                        <span>MEI ~15%</span>
                                        <span>50%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Card - Matching Demo Style */}
                        <div className="relative">
                            {/* Glow effect */}
                            <div className={`absolute -inset-2 rounded-3xl blur-xl transition-all duration-500 ${result.isPrejuizo
                                    ? 'bg-red-500/30'
                                    : result.lucroLiquido > 0
                                        ? 'bg-green-500/30'
                                        : 'bg-white/5'
                                }`}></div>

                            <div className="relative bg-[#0d0d0d] rounded-2xl border border-white/10 overflow-hidden">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[#111] to-[#0a0a0a]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${result.isPrejuizo
                                                    ? 'bg-red-500 shadow-red-500/20'
                                                    : 'bg-gradient-to-br from-[#00ff88] to-[#00d4ff] shadow-green-500/20'
                                                }`}>
                                                {result.isPrejuizo ? (
                                                    <TrendingDown className="w-5 h-5 text-white" />
                                                ) : (
                                                    <TrendingUp className="w-5 h-5 text-black" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-base font-bold text-white">Resultado</span>
                                                <span className="text-base font-bold text-[#00ff88]"> em Tempo Real</span>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full ${result.isPrejuizo
                                                ? 'bg-red-500/20 border border-red-500/30'
                                                : 'bg-green-500/20 border border-green-500/30'
                                            }`}>
                                            <span className={`text-xs font-semibold ${result.isPrejuizo ? 'text-red-400' : 'text-green-400'
                                                }`}>● AO VIVO</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Product Name Display */}
                                    {productData.nome && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Produto Analisado</label>
                                            <div className="text-xl font-bold text-white">{productData.nome}</div>
                                        </div>
                                    )}

                                    {/* Cost and Price Cards */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                                            <label className="text-xs text-orange-400 uppercase tracking-wider block mb-1">💰 Custo</label>
                                            <div className="text-2xl font-black text-white">
                                                {formatCurrency(productData.custoProducao)}
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
                                            <label className="text-xs text-cyan-400 uppercase tracking-wider block mb-1">🏷️ Preço</label>
                                            <div className="text-2xl font-black text-white">
                                                {formatCurrency(productData.precoVenda)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Result Alert */}
                                    <div className={`relative rounded-xl p-5 overflow-hidden ${result.isPrejuizo
                                            ? 'bg-gradient-to-r from-red-900/50 to-red-800/30 border-2 border-red-500'
                                            : 'bg-gradient-to-r from-green-900/50 to-green-800/30 border-2 border-green-500'
                                        }`}>
                                        {/* Glow effect */}
                                        <div className={`absolute inset-0 ${result.isPrejuizo ? 'bg-red-500/10' : 'bg-green-500/10'} animate-pulse`}></div>

                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.isPrejuizo
                                                        ? 'bg-red-500 shadow-lg shadow-red-500/50'
                                                        : 'bg-green-500 shadow-lg shadow-green-500/50'
                                                    }`}>
                                                    {result.isPrejuizo ? (
                                                        <AlertTriangle className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <CheckCircle className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-xl font-black ${result.isPrejuizo ? 'text-red-400' : 'text-green-400'
                                                        }`}>
                                                        {result.isPrejuizo ? '🚨 PREJUÍZO!' : '✅ LUCRO SAUDÁVEL!'}
                                                    </p>
                                                    <p className={`text-sm ${result.isPrejuizo ? 'text-red-300' : 'text-green-300'
                                                        }`}>
                                                        {result.isPrejuizo ? 'Você está PAGANDO para vender!' : 'Sua margem está saudável!'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-3xl font-black ${result.isPrejuizo ? 'text-red-400' : 'text-green-400'
                                                    }`}>
                                                    {formatPercentage(result.margem)}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {formatCurrency(result.lucroLiquido)}/un
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={aiLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-purple-500 text-black font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg group"
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <Bot className="w-6 h-6" />
                                    ATIVAR CONSULTOR I.A.
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* AI Response Card */}
                        {(aiLoading || aiResponse) && (
                            <div className="relative">
                                {/* Animated Gradient Border */}
                                <div className="absolute -inset-[2px] bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-purple-500 rounded-2xl animate-pulse opacity-60"></div>

                                <div className="relative bg-[#111111] rounded-2xl p-6 border border-transparent">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-black" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Consultor I.A.</h3>
                                            <p className="text-xs text-gray-500">GPT-4o-mini</p>
                                        </div>
                                    </div>

                                    {aiLoading ? (
                                        <div className="space-y-2">
                                            <div className="h-4 bg-white/10 rounded animate-pulse w-full"></div>
                                            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-300 leading-relaxed">
                                            {aiResponse}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* History Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <History className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Histórico</h2>
                                    <p className="text-sm text-gray-500">Últimas análises</p>
                                </div>
                            </div>

                            {historyLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8">
                                    <History className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Nenhuma análise ainda</p>
                                    <p className="text-gray-600 text-xs mt-1">Use o consultor I.A. para começar</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {history.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-white text-sm truncate">{entry.produto}</span>
                                                <button
                                                    onClick={() => handleDeleteHistory(entry.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${entry.margem < 0
                                                    ? 'bg-[#ff3355]/20 text-[#ff3355]'
                                                    : 'bg-[#00ff88]/20 text-[#00ff88]'
                                                    }`}>
                                                    {entry.margem.toFixed(1)}%
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Custom Slider Styles */}
            <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ff88, #00d4ff);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ff88, #00d4ff);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }
      `}</style>
        </div>
    )
}
