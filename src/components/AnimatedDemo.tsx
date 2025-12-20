'use client'

import { useState, useEffect } from 'react'
import { Zap, Bot, TrendingUp, TrendingDown, Sparkles, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

// Cenários de demo para rotacionar
const DEMO_SCENARIOS = [
    {
        produto: '🍕 Pizza Margherita',
        custo: 18.50,
        preco: 45.00,
        margem: 45.2,
        lucro: 20.35,
        isPrejuizo: false,
        aiResponse: '📈 Margem excelente para pizzaria! Ideal do setor: 40-50%. Você pode escalar!'
    },
    {
        produto: '🍔 Hambúrguer Artesanal',
        custo: 22.00,
        preco: 18.00,
        margem: -22.2,
        lucro: -4.00,
        isPrejuizo: true,
        aiResponse: '🚨 URGENTE: Aumente para R$ 32,00 ou reduza o custo do blend!'
    },
    {
        produto: '🧁 Brigadeiro Gourmet',
        custo: 1.80,
        preco: 6.00,
        margem: 60.0,
        lucro: 3.60,
        isPrejuizo: false,
        aiResponse: '✅ Margem saudável para doces! Continue assim e escale a produção.'
    }
]

export default function AnimatedDemo() {
    const [currentScenario, setCurrentScenario] = useState(0)
    const [phase, setPhase] = useState<'ready' | 'processing' | 'result'>('ready')

    const scenario = DEMO_SCENARIOS[currentScenario]

    // Ciclo de animação
    useEffect(() => {
        const cycle = () => {
            // Fase 1: Ready (mostrar dados)
            setPhase('ready')

            // Fase 2: Processing (após 1.5s)
            setTimeout(() => setPhase('processing'), 1500)

            // Fase 3: Result (após 3.5s)
            setTimeout(() => setPhase('result'), 3500)

            // Reset e próximo cenário (após 7s)
            setTimeout(() => {
                setCurrentScenario((prev) => (prev + 1) % DEMO_SCENARIOS.length)
            }, 7000)
        }

        cycle()
        const interval = setInterval(cycle, 7000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative w-full max-w-2xl mx-auto px-2 sm:px-0">
            {/* Glow effect animado */}
            <div className={`absolute -inset-4 rounded-3xl blur-2xl transition-all duration-1000 ${phase === 'result'
                ? scenario.isPrejuizo
                    ? 'bg-red-500/40 animate-pulse'
                    : 'bg-green-500/40 animate-pulse'
                : 'bg-cyan-500/20'
                }`}></div>

            <div className="relative bg-[#0d0d0d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[#111] to-[#0a0a0a]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center shadow-lg shadow-green-500/20">
                                <Zap className="w-5 h-5 text-black" strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="text-base font-bold text-white">ProfitScan</span>
                                <span className="text-base font-bold text-[#00ff88]">AI</span>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                            <span className="text-xs font-semibold text-green-400">● AO VIVO</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Produto */}
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5">
                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1 sm:mb-2">Produto Analisado</label>
                        <div className="text-lg sm:text-2xl font-bold text-white">{scenario.produto}</div>
                    </div>

                    {/* Cards de Custo e Preço - SEMPRE VISÍVEIS */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-3 sm:p-4 border border-orange-500/20">
                            <label className="text-[10px] sm:text-xs text-orange-400 uppercase tracking-wider block mb-1 sm:mb-2">💰 Custo</label>
                            <div className="text-xl sm:text-3xl font-black text-white">
                                R$ {scenario.custo.toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-3 sm:p-4 border border-cyan-500/20">
                            <label className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider block mb-1 sm:mb-2">🏷️ Preço</label>
                            <div className="text-xl sm:text-3xl font-black text-white">
                                R$ {scenario.preco.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* PROCESSING STATE - Spinner sempre visível */}
                    {phase !== 'result' && (
                        <div className="bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-xl p-4 sm:p-6 border border-cyan-500/30 animate-pulse">
                            <div className="flex items-center justify-center gap-3 sm:gap-4">
                                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-spin" />
                                <div>
                                    <p className="text-lg sm:text-xl font-bold text-white">Processando...</p>
                                    <p className="text-xs sm:text-sm text-cyan-400">A I.A. está analisando</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RESULT STATE - Alerta bem chamativo */}
                    {phase === 'result' && (
                        <>
                            {/* Alerta Principal */}
                            <div className={`relative rounded-xl p-3 sm:p-5 overflow-hidden ${scenario.isPrejuizo
                                ? 'bg-gradient-to-r from-red-900/50 to-red-800/30 border-2 border-red-500'
                                : 'bg-gradient-to-r from-green-900/50 to-green-800/30 border-2 border-green-500'
                                }`}>
                                {/* Efeito de brilho */}
                                <div className={`absolute inset-0 ${scenario.isPrejuizo ? 'bg-red-500/10' : 'bg-green-500/10'} animate-pulse`}></div>

                                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${scenario.isPrejuizo
                                            ? 'bg-red-500 shadow-lg shadow-red-500/50'
                                            : 'bg-green-500 shadow-lg shadow-green-500/50'
                                            }`}>
                                            {scenario.isPrejuizo ? (
                                                <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-base sm:text-2xl font-black ${scenario.isPrejuizo ? 'text-red-400' : 'text-green-400'}`}>
                                                {scenario.isPrejuizo ? '🚨 PREJUÍZO!' : '✅ LUCRO!'}
                                            </p>
                                            <p className={`text-xs sm:text-sm ${scenario.isPrejuizo ? 'text-red-300' : 'text-green-300'}`}>
                                                {scenario.isPrejuizo ? 'Pagando para vender!' : 'Margem excelente!'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl sm:text-4xl font-black ${scenario.isPrejuizo ? 'text-red-400' : 'text-green-400'}`}>
                                            {scenario.margem > 0 ? '+' : ''}{scenario.margem.toFixed(1)}%
                                        </p>
                                        <p className="text-xs sm:text-base text-gray-400">
                                            {scenario.lucro > 0 ? '+' : ''}R$ {scenario.lucro.toFixed(2)}/un
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Resposta da I.A. */}
                            <div className="relative">
                                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl opacity-75 animate-pulse"></div>
                                <div className="relative bg-[#111] rounded-xl p-3 sm:p-4">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-purple-400">Consultor I.A.</span>
                                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
                                    </div>
                                    <p className="text-white text-sm sm:text-base leading-relaxed">{scenario.aiResponse}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer com indicadores */}
                <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-600">Demonstração em tempo real</span>
                    <div className="flex gap-2">
                        {DEMO_SCENARIOS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentScenario
                                    ? 'bg-cyan-400 scale-125'
                                    : 'bg-gray-700'
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
