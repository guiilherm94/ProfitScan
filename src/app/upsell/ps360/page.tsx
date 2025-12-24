'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import {
    PieChart, CheckCircle, Zap, TrendingUp,
    ArrowDown, Clock, Shield, Sparkles, Package,
    Upload, FileText, RefreshCw, Layers, DollarSign
} from 'lucide-react'

export default function UpsellPS360Page() {
    const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 })
    const [progress, setProgress] = useState(0)

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

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header with urgency */}
            <header className="bg-gradient-to-r from-orange-600 to-yellow-500 py-6 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-xl md:text-2xl font-black text-black mb-4">
                        🎉 PARABÉNS! Quer turbinar seus resultados?
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
                            UPGRADE EXCLUSIVO: <span className="text-orange-400 font-bold">SISTEMA COMPLETO DE GESTÃO</span>
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
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">ProfitScan Detector garantido! Sua calculadora de lucro está pronta.</span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        E se você pudesse ter a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">gestão completa</span> de{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">TODOS os seus produtos</span> em um só lugar?
                    </h2>

                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        O <strong className="text-white">ProfitScan 360º</strong> é o módulo profissional que transforma a forma como você precifica.
                        Cadastre ingredientes, monte fichas técnicas, controle taxas e descubra o <strong className="text-green-400">lucro real de cada produto</strong> — tudo com ajuda da I.A.
                    </p>
                </div>

                {/* Pain Points Section */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 mb-8">
                    <h3 className="text-red-400 font-bold text-lg mb-4 text-center">Você já passou por isso?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            'Não sabe exatamente quanto gasta para produzir cada item',
                            'Seus preços são baseados em "achismo" ou na concorrência',
                            'Não desconta taxas de cartão, embalagem, entrega...',
                            'Tem vários produtos e não sabe qual realmente dá lucro',
                            'Cada receita nova é uma planilha nova (ou papel)',
                            'Esquece de considerar o rateio das despesas fixas',
                        ].map((pain, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">✗</span>
                                <span className="text-gray-400 text-sm">{pain}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Solution Section */}
                <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-bold text-white text-xl">ProfitScan</span>
                        <span className="text-orange-400 font-bold text-xl">360º</span>
                        <span className="text-gray-500 text-sm ml-2">resolve tudo isso</span>
                    </div>

                    <p className="text-center text-gray-300 mb-6">
                        Um sistema robusto de precificação onde você cadastra uma vez e tem controle para sempre.
                    </p>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Feature 1 */}
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h4 className="text-white font-bold">I.A. Extrai Tudo Sozinha</h4>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Manda foto da receita, cola o texto, importa do Excel... a I.A. lê, identifica os ingredientes e monta a ficha técnica automaticamente. <strong className="text-cyan-400">Zero trabalho manual.</strong>
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-purple-400" />
                                </div>
                                <h4 className="text-white font-bold">Multi-Produtos Organizados</h4>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Cada produto com sua ficha técnica própria. Ingredientes, rendimento, taxas específicas... <strong className="text-purple-400">tudo separado e calculado individualmente.</strong>
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-orange-400" />
                                </div>
                                <h4 className="text-white font-bold">Fichas Técnicas Profissionais</h4>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Cadastre ingredientes com custo por unidade. A ficha calcula automaticamente: <strong className="text-orange-400">custo de produção, taxas, despesas fixas rateadas e lucro real.</strong>
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 text-green-400" />
                                </div>
                                <h4 className="text-white font-bold">Atualização em Cascata</h4>
                            </div>
                            <p className="text-gray-400 text-sm">
                                O açúcar subiu? Atualiza uma vez e <strong className="text-green-400">todos os produtos que usam açúcar recalculam automaticamente.</strong> Nunca mais "esquecer de atualizar".
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Feature Highlight */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <h3 className="text-white font-bold text-lg">Inteligência Artificial Trabalhando Por Você</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="bg-black/30 rounded-xl p-4">
                            <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <p className="text-white font-medium text-sm mb-1">Envie foto ou texto</p>
                            <p className="text-gray-500 text-xs">De qualquer receita ou lista</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4">
                            <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                            <p className="text-white font-medium text-sm mb-1">I.A. processa</p>
                            <p className="text-gray-500 text-xs">Extrai ingredientes e quantidades</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4">
                            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-white font-medium text-sm mb-1">Ficha pronta!</p>
                            <p className="text-gray-500 text-xs">Com custo calculado automaticamente</p>
                        </div>
                    </div>

                    <p className="text-center text-gray-400 text-sm mt-4">
                        A I.A. também distribui seu faturamento entre os produtos automaticamente para calcular o lucro real com rateio de despesas fixas!
                    </p>
                </div>

                {/* What's Included */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-bold text-lg mb-4 text-center">Tudo que você recebe no 360º:</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                        {[
                            { text: 'Cadastro ilimitado de ingredientes e matérias-primas', icon: Package },
                            { text: 'Ficha técnica automática para cada produto', icon: FileText },
                            { text: 'Custo real por unidade calculado automaticamente', icon: DollarSign },
                            { text: 'Controle de taxas variáveis por produto', icon: TrendingUp },
                            { text: 'Rateio inteligente de despesas fixas', icon: Layers },
                            { text: 'I.A. extrai receitas de foto, texto ou Excel', icon: Sparkles },
                            { text: 'I.A. distribui faturamento automaticamente', icon: Zap },
                            { text: 'Recálculo em cascata (atualiza tudo de uma vez)', icon: RefreshCw },
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <benefit.icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparison */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 overflow-hidden">
                    <h3 className="text-white font-bold text-lg mb-4 text-center">Detector vs 360º</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-blue-400 font-bold mb-3 text-center">ProfitScan Detector ✓</p>
                            <p className="text-gray-500 text-sm text-center mb-3">Você já tem!</p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400" /> Calculadora de lucro rápida</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400" /> Análise de margem por venda</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400" /> Sugestões da I.A.</li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-xl p-4 border border-orange-500/30">
                            <p className="text-orange-400 font-bold mb-3 text-center">+ ProfitScan 360º</p>
                            <p className="text-gray-500 text-sm text-center mb-3">Adicione agora!</p>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Gestão de múltiplos produtos</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Fichas técnicas completas</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Controle de ingredientes</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Taxas e despesas rateadas</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> I.A. extrai receitas</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Recálculo automático</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="text-center mb-8">
                    <p className="text-gray-400 text-lg mb-2">
                        Adicione ao seu pedido por apenas
                    </p>
                    <p className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-1">
                        + R$ 29,90
                    </p>
                    <p className="text-gray-500 mb-4">Pagamento único • Acesso por 1 ano</p>

                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-6">
                        <Shield className="w-4 h-4" />
                        <span>7 dias de garantia incondicional</span>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                    <a
                        href="https://vitrinego.mycartpanda.com/ex-ocu/next-offer/qJjMXeoYNl?accepted=yes"
                        className="block w-full max-w-md mx-auto py-5 px-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-xl font-black rounded-2xl text-center hover:scale-105 transition-transform shadow-lg shadow-orange-500/30"
                    >
                        SIM, QUERO O 360º! 🚀
                    </a>
                    <p className="text-center text-gray-600 text-sm mt-3">
                        Clique para adicionar ao seu pedido
                    </p>
                </div>

                {/* Urgency message */}
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-bold">OFERTA EXCLUSIVA PÓS-COMPRA</span>
                    </div>
                    <p className="text-gray-300">
                        Este preço especial de <strong className="text-white">R$ 29,90</strong> só está disponível agora.
                        O valor normal é R$ 97/ano. <strong className="text-orange-400">Economize 69%!</strong>
                    </p>
                </div>

                {/* No thanks link */}
                <div className="text-center mb-12">
                    <p className="text-gray-600 text-sm mb-4">
                        Prefere continuar só com a calculadora básica?
                    </p>
                    <a href="https://vitrinego.mycartpanda.com/ex-ocu/next-offer/qJjMXeoYNl?accepted=no" className="text-gray-500 text-sm underline hover:text-gray-400">
                        Não, obrigado. Não preciso de gestão completa.
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
                    <p className="text-gray-600 text-sm mb-3">
                        © 2024 ProfitScan. Todos os direitos reservados.
                    </p>
                    <p className="text-gray-700 text-[10px] max-w-md mx-auto leading-relaxed">
                        *Acesso válido por 12 meses. Após este período, caso deseje continuar utilizando,
                        a renovação estará disponível por R$ 97,00/ano ou R$ 9,90/mês.
                    </p>
                </div>
            </footer>

            {/* CartPanda OCU Script */}
            <Script
                src="https://assets.mycartpanda.com/cartx-ecomm-ui-assets/js/libs/ocu-external.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // @ts-expect-error - OcuExternal is loaded externally
                    if (typeof OcuExternal !== 'undefined') new OcuExternal();
                }}
            />
        </div>
    )
}
