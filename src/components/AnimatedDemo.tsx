'use client'

import { useState, useEffect } from 'react'
import { Zap, Bot, Loader2, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'

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
    const [phase, setPhase] = useState<'processing' | 'result'>('processing')

    const scenario = DEMO_SCENARIOS[currentScenario]

    // Ciclo de animação
    useEffect(() => {
        const cycle = () => {
            // Fase 1: Processing
            setPhase('processing')

            // Fase 2: Result (após 2s)
            setTimeout(() => setPhase('result'), 2000)

            // Reset e próximo cenário (após 5s)
            setTimeout(() => {
                setCurrentScenario((prev) => (prev + 1) % DEMO_SCENARIOS.length)
            }, 5000)
        }

        cycle()
        const interval = setInterval(cycle, 5000)
        return () => clearInterval(interval)
    }, [])

    const isProcessing = phase === 'processing'

    return (
        <div className="relative w-full max-w-2xl mx-auto px-2 sm:px-0">
            {/* Glow effect */}
            <div className={`absolute -inset-4 rounded-3xl blur-2xl transition-all duration-500 ${!isProcessing
                ? scenario.isPrejuizo
                    ? 'bg-red-500/30'
                    : 'bg-green-500/30'
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

                <div className="p-4 sm:p-6 space-y-4">
                    {/* Card 1: Produto - Sempre visível */}
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5">
                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Produto Analisado</label>
                        <div className="text-lg sm:text-2xl font-bold text-white">{scenario.produto}</div>
                    </div>

                    {/* Cards de Custo e Preço - Sempre visíveis */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-3 sm:p-4 border border-orange-500/20">
                            <label className="text-[10px] sm:text-xs text-orange-400 uppercase tracking-wider block mb-1">💰 Custo</label>
                            <div className="text-xl sm:text-3xl font-black text-white">
                                R$ {scenario.custo.toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-3 sm:p-4 border border-cyan-500/20">
                            <label className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider block mb-1">🏷️ Preço</label>
                            <div className="text-xl sm:text-3xl font-black text-white">
                                R$ {scenario.preco.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Resultado - Sempre visível, muda conteúdo */}
                    <div className={`rounded-xl p-4 border-2 transition-all duration-500 h-[88px] flex items-center ${isProcessing
                        ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-cyan-500/30'
                        : scenario.isPrejuizo
                            ? 'bg-gradient-to-r from-red-900/40 to-red-800/20 border-red-500'
                            : 'bg-gradient-to-r from-green-900/40 to-green-800/20 border-green-500'
                        }`}>
                        {isProcessing ? (
                            // Estado: Processando
                            <div className="flex items-center justify-center gap-3 w-full">
                                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                <div>
                                    <p className="text-lg font-bold text-white">Analisando margem...</p>
                                    <p className="text-sm text-cyan-400">Calculando lucro real</p>
                                </div>
                            </div>
                        ) : (
                            // Estado: Resultado
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${scenario.isPrejuizo
                                        ? 'bg-red-500 shadow-lg shadow-red-500/50'
                                        : 'bg-green-500 shadow-lg shadow-green-500/50'
                                        }`}>
                                        {scenario.isPrejuizo ? (
                                            <AlertTriangle className="w-6 h-6 text-white" />
                                        ) : (
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className={`text-lg font-black ${scenario.isPrejuizo ? 'text-red-400' : 'text-green-400'}`}>
                                            {scenario.isPrejuizo ? '🚨 PREJUÍZO!' : '✅ LUCRO!'}
                                        </p>
                                        <p className={`text-sm ${scenario.isPrejuizo ? 'text-red-300' : 'text-green-300'}`}>
                                            {scenario.lucro > 0 ? '+' : ''}R$ {scenario.lucro.toFixed(2)}/un
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-3xl sm:text-4xl font-black ${scenario.isPrejuizo ? 'text-red-400' : 'text-green-400'}`}>
                                        {scenario.margem > 0 ? '+' : ''}{scenario.margem.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card 4: Consultor I.A. - Sempre visível, muda conteúdo */}
                    <div className="relative rounded-xl overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-opacity duration-500 ${isProcessing ? 'opacity-30' : 'opacity-75'
                            }`}></div>
                        <div className="relative bg-[#111] m-[2px] rounded-xl p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-purple-400">Consultor I.A.</span>
                                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                            </div>
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                    <p className="text-gray-400 text-sm">Gerando recomendação personalizada...</p>
                                </div>
                            ) : (
                                <p className="text-white text-sm sm:text-base leading-relaxed">{scenario.aiResponse}</p>
                            )}
                        </div>
                    </div>
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
