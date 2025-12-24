'use client'

import { useState, useEffect } from 'react'
import {
    PieChart, CheckCircle, Zap, TrendingUp, Calculator,
    ArrowDown, Clock, Shield, Sparkles, ChefHat
} from 'lucide-react'

export default function UpsellPS360Page() {
    const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 })
    const [progress, setProgress] = useState(0)
    const [animatedProfit, setAnimatedProfit] = useState(0)
    const [animatedCost, setAnimatedCost] = useState(0)
    const [animatedMargin, setAnimatedMargin] = useState(0)

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 }
                } else if (prev.minutes > 0) {
                    return { minutes: prev.minutes - 1, seconds: 59 }
                }
                return prev
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Progress bar animation
    useEffect(() => {
        const timer = setTimeout(() => setProgress(99), 500)
        return () => clearTimeout(timer)
    }, [])

    // Animation for the product demo
    useEffect(() => {
        const interval = setInterval(() => {
            // Animate profit calculation
            setAnimatedCost(prev => {
                const newVal = prev + 0.47
                return newVal > 12.50 ? 0 : newVal
            })
        }, 50)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        setAnimatedProfit(45.00 - animatedCost)
        setAnimatedMargin(((45.00 - animatedCost) / 45.00) * 100)
    }, [animatedCost])

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header with urgency */}
            <header className="bg-gradient-to-r from-orange-600 to-yellow-500 py-6 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-xl md:text-2xl font-black text-black mb-4">
                        ⚠️ ESPERA! TEMOS UMA OFERTA EXCLUSIVA PARA VOCÊ
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="bg-black/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                            <span className="text-3xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <p className="text-xs text-white/80">Minutos</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                            <span className="text-3xl font-black text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <p className="text-xs text-white/80">Segundos</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress bar section */}
            <section className="bg-[#111] border-b border-white/10 py-6 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                            ANTES DE FINALIZAR, DESCUBRA A <span className="text-orange-400 font-bold">FERRAMENTA QUE VAI REVOLUCIONAR SUA PRECIFICAÇÃO</span>
                        </p>
                        <span className="text-orange-400 font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-2">Sua compra está quase concluída</p>
                </div>
            </section>

            {/* Arrows */}
            <div className="flex justify-center gap-2 py-4 bg-[#0a0a0a]">
                <ArrowDown className="w-5 h-5 text-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <ArrowDown className="w-5 h-5 text-orange-400 animate-bounce" style={{ animationDelay: '100ms' }} />
                <ArrowDown className="w-5 h-5 text-orange-400 animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>

            {/* Main content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Headline */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Acesse o <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">ProfitScan 360º</span> —
                        calcule custos, precifique seus produtos e descubra seu <span className="text-green-400">lucro real</span> com precisão absoluta.
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Pare de precificar no "achismo". Economize tempo e maximize seus lucros com cálculos automáticos e Inteligência Artificial.
                    </p>
                </div>

                {/* Animated Product Demo */}
                <div className="relative mb-10">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden">
                        {/* Glowing effect */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-yellow-500/20 rounded-full blur-3xl" />

                        <div className="relative">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <span className="font-bold text-white text-xl">ProfitScan</span>
                                    <span className="text-orange-400 font-bold text-xl"> 360º</span>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                                    <span className="text-purple-400 text-sm font-medium">I.A. Ativa</span>
                                </div>
                            </div>

                            {/* Product being calculated animation */}
                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                <div className="flex items-center gap-4 mb-6">
                                    <ChefHat className="w-10 h-10 text-orange-400" />
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Bolo de Chocolate Premium</h3>
                                        <p className="text-gray-500 text-sm">Calculando precificação em tempo real...</p>
                                    </div>
                                </div>

                                {/* Animated calculations */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Custo Produção</p>
                                        <p className="text-xl font-bold text-orange-400">
                                            R$ {animatedCost.toFixed(2)}
                                        </p>
                                        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-500 transition-all duration-75"
                                                style={{ width: `${(animatedCost / 12.50) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Preço Venda</p>
                                        <p className="text-xl font-bold text-white">R$ 45,00</p>
                                        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-white/50 w-full" />
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Margem Real</p>
                                        <p className={`text-xl font-bold ${animatedMargin >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {animatedMargin.toFixed(1)}%
                                        </p>
                                        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-75 ${animatedMargin >= 50 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                style={{ width: `${animatedMargin}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Profit display */}
                                <div className={`rounded-xl p-4 border ${animatedProfit > 30 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className={`w-6 h-6 ${animatedProfit > 30 ? 'text-green-400' : 'text-yellow-400'}`} />
                                            <span className={animatedProfit > 30 ? 'text-green-400' : 'text-yellow-400'}>
                                                Lucro Real (com rateio de despesas):
                                            </span>
                                        </div>
                                        <span className={`text-2xl font-black ${animatedProfit > 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            R$ {animatedProfit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Features being processed */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                                {[
                                    { icon: Calculator, label: 'Custos Automáticos', active: true },
                                    { icon: Sparkles, label: 'I.A. Integrada', active: true },
                                    { icon: TrendingUp, label: 'Margem Real', active: true },
                                    { icon: Zap, label: 'Recálculo Instantâneo', active: true },
                                ].map((feature, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/5 rounded-lg p-3 flex items-center gap-2 border border-white/5"
                                    >
                                        <feature.icon className="w-4 h-4 text-orange-400" />
                                        <span className="text-xs text-gray-300">{feature.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="text-center mb-8">
                    <p className="text-gray-400 text-lg mb-2">
                        De <span className="line-through text-red-400">R$ 197,00</span> por apenas
                    </p>
                    <p className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-1">
                        R$ 47,00
                    </p>
                    <p className="text-gray-500 mb-4">Pagamento único • Acesso vitalício</p>

                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-6">
                        <Shield className="w-4 h-4" />
                        <span>7 dias de garantia incondicional</span>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                    <a
                        href="#checkout"
                        className="block w-full max-w-md mx-auto py-5 px-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-xl font-black rounded-2xl text-center hover:scale-105 transition-transform shadow-lg shadow-orange-500/30"
                    >
                        SIM, QUERO LUCRAR MAIS! 💰
                    </a>
                    <p className="text-center text-gray-600 text-sm mt-3">
                        Clique acima e complete sua compra com este upgrade
                    </p>
                </div>

                {/* Benefits list */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-bold text-lg mb-4 text-center">O que você recebe:</h3>
                    <div className="space-y-3">
                        {[
                            'Cadastro ilimitado de ingredientes e matérias-primas',
                            'Ficha técnica automática para produtos fabricados',
                            'Cálculo de custo real por unidade',
                            'Controle de taxas variáveis (cartão, embalagem, etc)',
                            'Rateio inteligente de despesas fixas',
                            'Extração de receitas com Inteligência Artificial',
                            'Distribuição automática de faturamento por I.A.',
                            'Lucro real calculado automaticamente',
                            'Suporte prioritário',
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-300">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checkout embed placeholder */}
                <div id="checkout" className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-gray-400 text-sm">Checkout Seguro</span>
                    </div>

                    {/* Placeholder for Hotmart/CartPanda embed */}
                    <div className="bg-black/50 rounded-xl p-8 text-center border border-dashed border-white/20">
                        <p className="text-gray-500 text-sm mb-2">
                            [ÁREA DO CHECKOUT]
                        </p>
                        <p className="text-gray-600 text-xs">
                            Cole aqui o embed do Hotmart/CartPanda
                        </p>
                    </div>
                </div>

                {/* Urgency message */}
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-bold">OFERTA POR TEMPO LIMITADO</span>
                    </div>
                    <p className="text-gray-300">
                        Esta é sua <strong className="text-white">única oportunidade</strong> de garantir o ProfitScan 360º por este preço especial.
                        Após fechar esta página, a oferta <strong className="text-red-400">não estará mais disponível</strong>.
                    </p>
                </div>

                {/* No thanks link */}
                <div className="text-center mb-12">
                    <p className="text-gray-600 text-sm mb-4">
                        Não quer aproveitar? Você perderá esta oferta exclusiva.
                    </p>
                    <a href="/obrigado" className="text-gray-500 text-sm underline hover:text-gray-400">
                        Não, obrigado. Quero continuar precificando no achismo.
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                            <PieChart className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-bold text-white">ProfitScan</span>
                        <span className="text-orange-400 font-bold">360º</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                        © 2024 ProfitScan. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    )
}
