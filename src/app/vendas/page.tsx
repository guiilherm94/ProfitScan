'use client'

import { useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import {
    Zap, Clock, Bot, SlidersHorizontal, Shield, Smartphone,
    ChevronDown, ChevronUp, Check, AlertTriangle, TrendingUp,
    Star, Lock, Mail, FileText
} from 'lucide-react'
import AnimatedDemo from '@/components/AnimatedDemo'

export default function VendasPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index)
    }

    const faqs = [
        {
            question: 'Preciso entender de matemática?',
            answer: 'Não. O ProfitScan faz toda a conta chata para você. Você só coloca o preço e os custos, a I.A. calcula tudo automaticamente.'
        },
        {
            question: 'Funciona no celular?',
            answer: 'Sim! Funciona perfeitamente em qualquer celular (Android ou iPhone) e computador. É 100% online, nada para instalar.'
        },
        {
            question: 'É mensalidade?',
            answer: 'Não! Nesta oferta de lançamento, o pagamento é ÚNICO. Você tem acesso vitalício à ferramenta.'
        },
        {
            question: 'Como recebo o acesso?',
            answer: 'Imediatamente após o pagamento, você recebe um e-mail com seu login e senha exclusivos para acessar a plataforma.'
        },
        {
            question: 'E se eu não gostar?',
            answer: 'Você tem 7 dias de garantia incondicional. Se não ficar satisfeito, devolvemos 100% do seu dinheiro, sem perguntas.'
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* BLOCO 01: A PROMESSA */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[150px]"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-8">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400 font-medium">ALERTA: Inflação de 2025</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                        <span className="text-white">PARE DE VENDER O ALMOÇO</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                            PARA PAGAR A JANTA.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                        A inflação "invisível" de 2025 está comendo seu lucro. Descubra em{' '}
                        <span className="text-white font-semibold">4 segundos</span> se o seu preço atual está te dando{' '}
                        <span className="text-red-400 font-semibold">Prejuízo</span> ou{' '}
                        <span className="text-green-400 font-semibold">Lucro Real</span> com a nova{' '}
                        <span className="text-cyan-400">Inteligência Artificial de Precificação</span>.
                    </p>

                    {/* Interactive Demo */}
                    <div className="mb-10">
                        <AnimatedDemo />
                    </div>

                    {/* CTA Button */}
                    <div className="space-y-3">
                        <a
                            href="#oferta"
                            className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-lg rounded-xl hover:scale-105 transition-transform shadow-lg shadow-green-500/25 animate-pulse"
                        >
                            👉 QUERO ESCANEAR MEU NEGÓCIO AGORA
                        </a>
                        <p className="text-sm text-gray-500">Acesso Vitalício por apenas <span className="text-green-400 font-semibold">R$ 19,90</span></p>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-gray-600" />
                </div>
            </section>

            {/* BLOCO 02: A FERIDA */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center leading-tight">
                        Você trabalha 12 horas por dia, a loja está cheia, mas...
                        <span className="block text-red-600 mt-2">Cadê o Dinheiro?</span>
                    </h2>

                    <div className="prose prose-lg max-w-none text-gray-700">
                        <p className="text-lg leading-relaxed">
                            Se você é dono de um pequeno negócio (<strong>Alimentação, Loja, Serviços</strong>), você conhece essa sensação:
                        </p>

                        <p className="text-lg leading-relaxed">
                            Você vende o dia todo. O <strong>Pix não para de cair</strong>. A maquininha não para de imprimir comprovante.
                            Mas chega o <strong>dia 5</strong>, dia de pagar os boletos e os fornecedores, e <span className="text-red-600 font-semibold">a conta não fecha</span>.
                        </p>

                        <p className="text-lg leading-relaxed">
                            Você se pergunta: <em>"Onde eu errei? O movimento foi bom!"</em>
                        </p>

                        <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
                            <p className="text-lg text-gray-800 font-medium mb-0">
                                Eu vou te contar a verdade que ninguém te conta: <strong>O erro não está na venda. O erro está na MATEMÁTICA.</strong>
                            </p>
                        </div>

                        <p className="text-lg leading-relaxed">
                            O gás aumentou. A taxa da maquininha mudou. A embalagem subiu 10 centavos.
                            E você? <strong>Continua cobrando o mesmo preço de 6 meses atrás.</strong>
                        </p>

                        <p className="text-xl font-semibold text-gray-900 bg-yellow-100 p-4 rounded-lg">
                            Resultado? Você acha que está lucrando R$ 2,00 por venda, mas na verdade está tendo um{' '}
                            <span className="text-red-600">prejuízo invisível de R$ 0,50</span>. Você está literalmente{' '}
                            <strong>pagando para o cliente levar seu produto embora</strong>.
                        </p>
                    </div>
                </div>
            </section>

            {/* BLOCO 03: A SOLUÇÃO */}
            <section className="py-20 px-4 bg-[#0a0a0a]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Chega de "Conta de Padaria".
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mt-2">
                                Conheça o ProfitScan I.A.™
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Esqueça as planilhas complexas de Excel que você nunca preenche. Esqueça as calculadoras manuais que te deixam confuso.
                        </p>
                    </div>

                    <p className="text-center text-xl text-white mb-12">
                        Nós criamos o <strong className="text-cyan-400">Primeiro Detector de Lucro Oculto</strong> para Pequenos Negócios.
                        Uma ferramenta <strong>simples, direta e brutalmente honesta</strong>.
                    </p>

                    {/* 3 Steps */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">1</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Insira seus Custos</h3>
                            <p className="text-gray-400 text-sm">Ingredientes, produto, embalagem. Bem simples.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">2</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Defina seu Preço</h3>
                            <p className="text-gray-400 text-sm">O valor que você cobra hoje pelo produto.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">3</div>
                            <h3 className="text-lg font-semibold text-white mb-2">A Mágica da I.A.</h3>
                            <p className="text-gray-400 text-sm">O sistema analisa tudo e te dá o VEREDITO final.</p>
                        </div>
                    </div>

                    {/* Results Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-6 text-center">
                            <div className="text-4xl mb-3">🔴</div>
                            <h4 className="text-lg font-bold text-red-400 mb-2">ALERTA DE PREJUÍZO</h4>
                            <p className="text-gray-400 text-sm">A I.A. te avisa na hora para você parar de vender e ajustar o preço.</p>
                        </div>
                        <div className="bg-green-500/10 border-2 border-green-500/50 rounded-2xl p-6 text-center">
                            <div className="text-4xl mb-3">🟢</div>
                            <h4 className="text-lg font-bold text-green-400 mb-2">LUCRO APROVADO</h4>
                            <p className="text-gray-400 text-sm">A I.A. confirma que sua margem é saudável e você pode escalar.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOCO 04: BENEFÍCIOS */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
                        Por que isso é diferente?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Diagnóstico em 4 Segundos</h3>
                                <p className="text-gray-600">Não perca tempo. Saiba a verdade sobre seu lucro na hora.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Consultor I.A. Integrado</h3>
                                <p className="text-gray-600">Receba dicas automáticas de como melhorar sua margem.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <SlidersHorizontal className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Simulador de Cenários</h3>
                                <p className="text-gray-600">"E se o gás aumentar?" Mexa no slider e veja o impacto no lucro.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                <Smartphone className="w-6 h-6 text-cyan-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">100% Online e Seguro</h3>
                                <p className="text-gray-600">Acesse pelo celular, tablet ou computador. Nada para instalar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOCO 05: A OFERTA */}
            <section id="oferta" className="py-20 px-4 bg-gradient-to-b from-[#0a0a0a] to-purple-950/30">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Quanto custa ter a paz de saber que você está{' '}
                        <span className="text-green-400">Lucrando de Verdade?</span>
                    </h2>

                    <div className="text-gray-400 text-lg mb-8 space-y-2">
                        <p>Um consultor financeiro cobraria <span className="line-through">R$ 2.000,00</span> para analisar seus preços.</p>
                        <p>Uma planilha complexa custaria <span className="line-through">R$ 97,00</span>.</p>
                    </div>

                    <p className="text-xl text-white mb-8">
                        Mas eu sei que o pequeno empreendedor precisa de ajuda <strong className="text-yellow-400">AGORA</strong>.
                        Por isso, nesta oferta de lançamento Beta:
                    </p>

                    {/* Price Card */}
                    <div className="relative max-w-md mx-auto mb-10">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 rounded-3xl opacity-50 blur-lg animate-pulse"></div>
                        <div className="relative bg-[#111] rounded-2xl p-8 border border-white/20">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400" fill="#facc15" />
                                ))}
                            </div>
                            <p className="text-gray-400 line-through text-2xl mb-2">De R$ 97,00</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-gray-400 text-xl">Por apenas</span>
                                <span className="text-5xl font-black text-green-400">R$ 19,90</span>
                            </div>
                            <p className="text-cyan-400 mt-4 font-medium">✨ Pagamento Único • Acesso Vitalício</p>
                        </div>
                    </div>

                    <p className="text-gray-400 mb-8">
                        Isso é menos que o valor de <strong className="text-white">UM LANCHE</strong>. É menos do que o dinheiro que você perde em{' '}
                        <strong className="text-red-400">UM DIA</strong> com o preço errado.
                    </p>

                    {/* CTA */}
                    <a
                        href="https://vitrinego.mycartpanda.com/checkout/204999344:1?tkg=ic"
                        className="inline-flex items-center gap-3 px-10 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-xl rounded-xl hover:scale-105 transition-transform shadow-xl shadow-green-500/30"
                    >
                        👉 QUERO MEU ACESSO VITALÍCIO AGORA
                    </a>

                    <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Pagamento Seguro</span>
                        <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> 7 Dias de Garantia</span>
                    </div>
                </div>
            </section>

            {/* BLOCO 06: GARANTIA */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full"></div>
                        <div className="absolute inset-2 bg-green-500 rounded-full flex items-center justify-center">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">7 DIAS</div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Teste sem Medo. Garantia Incondicional.
                    </h2>

                    <p className="text-lg text-gray-600 leading-relaxed">
                        Entre, use a ferramenta, simule seus preços. Se você achar que ela <strong>não colocou dinheiro no seu bolso</strong>,
                        eu devolvo seus R$ 19,90. <strong className="text-green-600">Sem perguntas. O risco é todo meu.</strong>
                    </p>
                </div>
            </section>

            {/* BLOCO 07: FAQ */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Perguntas Frequentes
                    </h2>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    {openFaq === index ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-4">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-16 px-4 bg-[#0a0a0a]">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Pronto para descobrir a verdade sobre seu lucro?
                    </h2>
                    <p className="text-gray-400 mb-8">Pare de perder dinheiro sem saber. Tome o controle agora.</p>
                    <a
                        href="https://vitrinego.mycartpanda.com/checkout/204999344:1?tkg=ic"
                        className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-lg rounded-xl hover:scale-105 transition-transform shadow-lg shadow-green-500/25"
                    >
                        👉 COMEÇAR AGORA POR R$ 19,90
                    </a>
                </div>
            </section>

            {/* RODAPÉ */}
            <footer className="py-8 px-4 bg-[#050505] border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-black" />
                            </div>
                            <span className="font-bold text-white">ProfitScan<span className="text-green-400">AI</span></span>
                        </div>

                        <div className="flex items-center gap-6 text-sm flex-wrap justify-center sm:justify-start">
                            <Link href="/privacidade" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                <FileText className="w-4 h-4" /> Privacidade
                            </Link>
                            <Link href="/termos" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                <FileText className="w-4 h-4" /> Termos
                            </Link>
                            <Link href="/aviso-legal" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                <FileText className="w-4 h-4" /> Aviso Legal
                            </Link>
                            <Link href="/reembolso" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                <FileText className="w-4 h-4" /> Reembolso
                            </Link>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-600 space-y-2">
                        <p>
                            Este site não faz parte do site do Facebook ou da Meta Platforms, Inc.
                            Além disso, este site NÃO é endossado pelo Facebook de nenhuma maneira.
                            FACEBOOK é uma marca comercial da META PLATFORMS, INC.
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <Mail className="w-3 h-3" /> molivesutter@gmail.com
                        </p>
                        <p>© 2025 ProfitScan AI. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Meta Pixel Code */}
            <Script id="meta-pixel" strategy="afterInteractive">
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '2308235273025002');
                    fbq('track', 'PageView');
                `}
            </Script>
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src="https://www.facebook.com/tr?id=2308235273025002&ev=PageView&noscript=1"
                    alt=""
                />
            </noscript>

            {/* TrackGO - Sistema de rastreamento v1.0.6 */}
            <Script id="trackgo" strategy="afterInteractive">
                {`
                    /** 
                    * TrackGO - Sistema de rastreamento de parâmetros do Facebook (Estratégia Shotgun)
                    * Versão: 1.0.6
                    */ 
                    (function() { 
                        'use strict'; 

                        const CONFIG = { 
                            ignoreAllIframes: !!document.querySelector('[data-trackgo-ignore-iframe]'), 
                            ignoreScriptRetry: !!document.querySelector('[data-trackgo-ignore-retry]'), 
                            fastStart: !!document.querySelector('[data-trackgo-fast-start]'), 
                            replacePlusSignal: !!document.querySelector('[data-trackgo-plus-signal]'), 
                            ignoreClasses: document.querySelector('[data-trackgo-ignore-classes]')?.getAttribute('data-trackgo-ignore-classes')?.split(' ')?.filter(c => !!c) || [],
                            forceUrlOverwrite: !!document.querySelector('[data-trackgo-force-url]')
                        }; 

                        const FB_PARAMS = ['fbclid', '_fbc', '_fbp']; 
                        const URL_PARAMS = ['fbclid', 'fbp', 'fbc'];
                        const SHOTGUN_PARAMS = ['subid4', 'aff_sub4', 'cid', 'sck'];
                        const ALL_PARAMS = [...URL_PARAMS, ...SHOTGUN_PARAMS];
                        const COOKIE_EXPIRATION_DAYS = 90; 
                        const INITIAL_DELAY = 3000;
                        const MAX_WAIT_FOR_FBP = 10000;
                        const CHECK_INTERVAL = 200;
                        
                        let currentParamCache = null; 
                        let lastUrlParams = ''; 
                        let isInitialized = false; 

                        function getCookie(name) { 
                            const pattern = new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                            const match = document.cookie.match(pattern); 
                            return match ? decodeURIComponent(match[2]) : null; 
                        } 

                        function isPublicSuffix(domain) {
                            const publicSuffixes = ['vercel.app', 'netlify.app', 'github.io', 'herokuapp.com', 'firebaseapp.com', 'web.app', 'pages.dev', 'workers.dev', 'azurewebsites.net', 'cloudfront.net', 'amplifyapp.com'];
                            return publicSuffixes.some(suffix => domain.endsWith(suffix));
                        }

                        function getTopLevelDomain() { 
                            const hostname = window.location.hostname;
                            if (isPublicSuffix(hostname)) { return null; }
                            const parts = hostname.split('.'); 
                            if (parts.length > 1) { return '.' + parts.slice(-2).join('.'); } 
                            return hostname; 
                        } 
                        
                        function setCookie(name, value, days = COOKIE_EXPIRATION_DAYS) { 
                            try { 
                                const expirationDate = new Date(); 
                                expirationDate.setTime(expirationDate.getTime() + (days * 24 * 60 * 60 * 1000)); 
                                const expires = "expires=" + expirationDate.toUTCString(); 
                                const tld = getTopLevelDomain();
                                const domainPart = tld ? ";domain=" + tld : "";
                                document.cookie = name + '=' + encodeURIComponent(value) + ';' + expires + ';path=/' + domainPart + ';SameSite=Lax;Secure'; 
                                return true; 
                            } catch (error) { console.error('TrackGO: Erro ao salvar cookie', error); return false; } 
                        } 

                        function generateShotgunValue(fbp, fbc) {
                            if (fbp && fbc) { return fbp + '|' + fbc; } 
                            else if (fbp) { return fbp; } 
                            else if (fbc) { return fbc; }
                            return null;
                        }
                        
                        function getSubdomainIndex() {
                            const hostname = window.location.hostname;
                            const parts = hostname.split('.');
                            if (parts.length <= 1 || /^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(hostname)) { return 0; }
                            if (parts.length > 2) { return 2; }
                            return 1;
                        }
                        
                        function generateFbc(fbclid) {
                            const subdomainIndex = getSubdomainIndex();
                            const creationTime = Date.now();
                            return 'fb.' + subdomainIndex + '.' + creationTime + '.' + fbclid;
                        }
                        
                        function generateAndSaveShotgunParams(fbp, fbc, fbclid) {
                            if (fbp) setCookie('fbp', fbp);
                            if (fbc) setCookie('fbc', fbc);
                            if (fbclid) setCookie('fbclid', fbclid);
                            const shotgunValue = generateShotgunValue(fbp, fbc);
                            if (shotgunValue) {
                                setCookie('subid4', shotgunValue);
                                setCookie('aff_sub4', shotgunValue);
                                setCookie('cid', shotgunValue);
                                setCookie('sck', shotgunValue);
                                console.log('TrackGO: Parâmetros shotgun salvos:', { fbp: fbp, fbc: fbc || '(não disponível)', fbclid: fbclid || '(não disponível)', shotgunValue: shotgunValue });
                            }
                        }

                        function hasInitiateCheckoutParam(url) {
                            try { const urlObj = new URL(url, window.location.origin); return urlObj.searchParams.get('tkg') === 'ic'; }
                            catch (error) { return url.includes('tkg=ic'); }
                        }
                        
                        function fireInitiateCheckout() {
                            try { 
                                if (typeof window.fbq === 'function') { 
                                    window.fbq('track', 'InitiateCheckout'); 
                                    console.log('TrackGO: Disparado fbq InitiateCheckout');
                                    return true; 
                                } else {
                                    console.warn('TrackGO: Facebook Pixel não encontrado (fbq não existe)');
                                    return false;
                                }
                            } catch (error) { console.error('TrackGO: Erro ao disparar InitiateCheckout', error); return false; }
                        }
                        
                        function checkCurrentPageForInitiateCheckout() { if (hasInitiateCheckoutParam(window.location.href)) { fireInitiateCheckout(); } }
                        
                        function extractTargetUrl(element) {
                            if (element.tagName === 'A' && element.href) return element.href;
                            const parentLink = element.closest('a'); if (parentLink && parentLink.href) return parentLink.href;
                            const dataUrl = element.getAttribute('data-url') || element.getAttribute('data-href') || element.getAttribute('data-link') || element.getAttribute('data-target');
                            if (dataUrl) return dataUrl;
                            const onclick = element.getAttribute('onclick');
                            if (onclick) { const locationMatch = onclick.match(/(?:window\\.)?location(?:\\.href)?\\s*=\\s*['\"](.*?)['\"]/) || onclick.match(/(?:window\\.)?open\\(['\"](.*?)['\"]/) || onclick.match(/href\\s*=\\s*['\"](.*?)['\"]/) || onclick.match(/url['\"]\\s*:\\s*['\"](.*?)['\"]/) || onclick.match(/['\"](https?:\\/\\/[^'\"]+)['\"]/); if (locationMatch) return locationMatch[1]; }
                            return null;
                        }
                        
                        function handleInitiateCheckoutClick(event, targetUrl) {
                            if (!hasInitiateCheckoutParam(targetUrl)) return false;
                            const link = event.target.closest('a');
                            if (link && (link.target === '_blank' || event.ctrlKey || event.metaKey || event.button === 1)) { fireInitiateCheckout(); return false; }
                            event.preventDefault(); event.stopPropagation();
                            console.log('TrackGO: Interceptando clique tkg=ic, disparando evento...');
                            fireInitiateCheckout();
                            setTimeout(() => { window.location.href = targetUrl; }, 150);
                            return true;
                        }
                        
                        function setupInitiateCheckoutListeners() {
                            document.addEventListener('click', function(event) { const element = event.target; const targetUrl = extractTargetUrl(element); if (targetUrl) { handleInitiateCheckoutClick(event, targetUrl); } }, true);
                            if (!CONFIG.ignoreAllIframes) { document.addEventListener('DOMContentLoaded', function() { checkIframesForInitiateCheckout(); }); }
                        }
                        
                        function checkIframesForInitiateCheckout() {
                            document.querySelectorAll('iframe').forEach(iframe => { if (iframe.src && hasInitiateCheckoutParam(iframe.src)) { fireInitiateCheckout(); } });
                        }

                        function initializeFbParams() { 
                            const urlParams = new URLSearchParams(window.location.search); 
                            const currentUrl = window.location.search; 
                            if (lastUrlParams === currentUrl && isInitialized) return; 
                            console.log('TrackGO: Processando parâmetros após Facebook Pixel...', currentUrl);
                            let hasNewParams = false; 
                            
                            let fbp = getCookie('_fbp');
                            const urlFbp = urlParams.get('_fbp') || urlParams.get('fbp');
                            if (urlFbp) {
                                if (!fbp || CONFIG.forceUrlOverwrite) {
                                    fbp = urlFbp;
                                    setCookie('_fbp', fbp);
                                    console.log('TrackGO: ' + (!getCookie('_fbp') ? 'Definiu' : 'Sobrescreveu') + ' _fbp=' + fbp + ' da URL');
                                    hasNewParams = true;
                                } else {
                                    console.log('TrackGO: _fbp já existe (' + fbp + '), ignorando valor da URL (' + urlFbp + ').');
                                }
                            }
                            
                            let fbc = getCookie('_fbc');
                            const fbclid = urlParams.get('fbclid');
                            
                            if (fbclid) {
                                const newFbc = generateFbc(fbclid);
                                setCookie('_fbc', newFbc);
                                if (fbc) { console.log('TrackGO: Novo clique detectado! Atualizando _fbc de ' + fbc + ' para ' + newFbc); }
                                else { console.log('TrackGO: Gerou _fbc=' + newFbc + ' a partir de fbclid'); }
                                fbc = newFbc;
                                hasNewParams = true;
                            } else {
                                const urlFbc = urlParams.get('_fbc') || urlParams.get('fbc');
                                if (urlFbc) {
                                    if (!fbc || CONFIG.forceUrlOverwrite) {
                                        fbc = urlFbc;
                                        setCookie('_fbc', fbc);
                                        console.log('TrackGO: Definiu _fbc=' + fbc + ' da URL');
                                        hasNewParams = true;
                                    }
                                }
                            }
                            
                            if (!fbp && !fbc) { console.warn('TrackGO: Nem _fbp nem _fbc disponíveis. Nenhum parâmetro para propagar.'); return; }
                            if (!fbp) { console.warn('TrackGO: _fbp não encontrado (possível AdBlocker), continuando apenas com _fbc'); }
                            if (!fbc) { console.log('TrackGO: _fbc não disponível, continuando apenas com _fbp'); }
                            
                            generateAndSaveShotgunParams(fbp, fbc, fbclid);
                            checkCurrentPageForInitiateCheckout();
                            lastUrlParams = currentUrl; 
                            if (hasNewParams) { console.log('TrackGO: Novos parâmetros detectados, limpando cache.'); currentParamCache = null; }
                            isInitialized = true; 
                        }

                        class ParamManager { 
                            static getFbParameters() { 
                                if (currentParamCache && lastUrlParams === window.location.search) return currentParamCache; 
                                console.log('TrackGO: Construindo parâmetros...');
                                const params = new Map(); 
                                ALL_PARAMS.forEach(param => { const cookieValue = getCookie(param); if (cookieValue && cookieValue !== '') { params.set(param, cookieValue); console.log('TrackGO: Cookie - ' + param + '=' + cookieValue); } });
                                currentParamCache = params; 
                                console.log('TrackGO: Parâmetros finais:', Array.from(params.entries()));
                                return params; 
                            } 
                            static addFbParametersToUrl(url) { 
                                if (!url) return url; 
                                try { 
                                    const urlObj = new URL(url, window.location.origin); 
                                    const allParams = this.getFbParameters(); 
                                    allParams.forEach((value, key) => { urlObj.searchParams.set(key, value); }); 
                                    let finalUrl = urlObj.toString(); 
                                    if (CONFIG.replacePlusSignal) finalUrl = finalUrl.split("+").join("%20"); 
                                    return finalUrl; 
                                } catch (error) { console.error('TrackGO: Erro ao processar URL', url, error); return url; } 
                            } 
                        }

                        function addParamsToLinks(onlyNew = false) { 
                            if (!isInitialized) return; 
                            document.querySelectorAll('a').forEach(link => { 
                                if (link.href.startsWith('mailto:') || link.href.startsWith('tel:') || link.href.includes('#') || CONFIG.ignoreClasses?.some(className => link.classList.contains(className))) return; 
                                try { 
                                    const originalHref = link.getAttribute('data-original-href') || link.href; 
                                    if (!link.getAttribute('data-original-href')) link.setAttribute('data-original-href', originalHref); 
                                    link.href = ParamManager.addFbParametersToUrl(originalHref); 
                                } catch (error) { console.error('TrackGO: Erro ao processar link', link.href, error); } 
                            }); 
                        }
                        
                        function addParamsToForms(onlyNew = false) { 
                            if (!isInitialized) return; 
                            document.querySelectorAll('form').forEach(form => { 
                                if (CONFIG.ignoreClasses?.some(className => form.classList.contains(className))) return; 
                                try { 
                                    if (form.action && form.action !== '') form.action = ParamManager.addFbParametersToUrl(form.action); 
                                    const allParams = ParamManager.getFbParameters();
                                    allParams.forEach((value, key) => { 
                                        const existingField = form.querySelector('input[name="' + key + '"]'); 
                                        if (existingField) { existingField.setAttribute('value', value); return; } 
                                        const hiddenField = document.createElement('input'); 
                                        hiddenField.type = 'hidden'; hiddenField.name = key; hiddenField.value = value;
                                        hiddenField.setAttribute('data-trackgo', 'true'); form.appendChild(hiddenField); 
                                    }); 
                                } catch (error) { console.error('TrackGO: Erro ao processar formulário', form, error); } 
                            }); 
                        }
                        
                        function addParamsToIframes() { 
                            if (CONFIG.ignoreAllIframes || !isInitialized) return; 
                            document.querySelectorAll('iframe').forEach(iframe => { 
                                const videoHosts = ['pandavideo.com', 'youtube.com', 'youtube-nocookie.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com', 'wistia.com', 'wistia.net', 'dailymotion.com', 'facebook.com/plugins/video', 'fast.wistia.net']; 
                                if (!iframe.src || iframe.src === '' || videoHosts.some(host => iframe.src.includes(host)) || CONFIG.ignoreClasses?.some(className => iframe.classList.contains(className))) return; 
                                try { if (hasInitiateCheckoutParam(iframe.src)) fireInitiateCheckout(); iframe.src = ParamManager.addFbParametersToUrl(iframe.src); } catch (error) { console.error('TrackGO: Erro ao processar iframe', iframe.src, error); } 
                            }); 
                        }

                        let mutationTimeout; 
                        function setupMutationObserver() { 
                            const observer = new MutationObserver(() => { 
                                clearTimeout(mutationTimeout); 
                                mutationTimeout = setTimeout(() => { if (isInitialized) { addParamsToLinks(true); addParamsToForms(true); if (!CONFIG.ignoreAllIframes) { addParamsToIframes(); } checkIframesForInitiateCheckout(); } }, 100); 
                            }); 
                            observer.observe(document.body, { subtree: true, childList: true }); 
                        }
                        
                        function overrideWindowOpen() { 
                            const originalWindowOpen = window.open; 
                            window.open = function(url, name, specs) { 
                                try { if (url && hasInitiateCheckoutParam(url.toString())) fireInitiateCheckout(); const processedUrl = url ? ParamManager.addFbParametersToUrl(url.toString()) : ''; return originalWindowOpen(processedUrl, name || '', specs || ''); } 
                                catch (error) { console.error('TrackGO: Erro ao processar window.open', url, error); return originalWindowOpen(url, name || '', specs || ''); } 
                            }; 
                        }
                        
                        function initialize() { 
                            try { 
                                console.log('TrackGO: Iniciando após aguardar Facebook Pixel...');
                                initializeFbParams(); 
                                if (isInitialized) { addParamsToLinks(); addParamsToForms(); if (!CONFIG.ignoreAllIframes) { addParamsToIframes(); } console.log('TrackGO: Inicialização completa!'); } 
                            } catch (error) { console.error('TrackGO: Erro durante inicialização', error); } 
                        }
                        
                        function forceRefresh() { console.log('TrackGO: Forçando atualização completa...'); currentParamCache = null; lastUrlParams = ''; isInitialized = false; initialize(); }
                        
                        function waitForFbpAndStart() {
                            let elapsed = 0;
                            const checkFbp = () => {
                                const fbp = getCookie('_fbp');
                                const fbc = getCookie('_fbc');
                                if (fbp) {
                                    console.log('TrackGO: _fbp encontrado após ' + (INITIAL_DELAY + elapsed) + 'ms total, iniciando...');
                                    if (fbc) { console.log('TrackGO: _fbc do Facebook Pixel: ' + fbc); }
                                    startTrackGO();
                                    return;
                                }
                                elapsed += CHECK_INTERVAL;
                                if (elapsed >= MAX_WAIT_FOR_FBP) {
                                    console.warn('TrackGO: _fbp não encontrado após ' + (INITIAL_DELAY + MAX_WAIT_FOR_FBP) + 'ms. Verifique o Facebook Pixel.');
                                    startTrackGO();
                                    return;
                                }
                                setTimeout(checkFbp, CHECK_INTERVAL);
                            };
                            console.log('TrackGO: Aguardando ' + INITIAL_DELAY + 'ms para Facebook Pixel processar...');
                            setTimeout(checkFbp, INITIAL_DELAY);
                        }
                        
                        function startTrackGO() {
                            initialize(); 
                            setupMutationObserver(); 
                            overrideWindowOpen(); 
                            setupInitiateCheckoutListeners();
                            let currentUrl = window.location.href; 
                            setInterval(() => { if (window.location.href !== currentUrl) { console.log('TrackGO: URL mudou, re-sincronizando...'); currentUrl = window.location.href; checkCurrentPageForInitiateCheckout(); forceRefresh(); } }, 500);
                            if (!CONFIG.ignoreScriptRetry) { setTimeout(() => { if (window.location.search !== lastUrlParams) forceRefresh(); else initialize(); }, 2000); setTimeout(initialize, 5000); }
                        }

                        function main() { waitForFbpAndStart(); } 
                        if (CONFIG.fastStart || document.readyState === 'complete') main(); else window.addEventListener('load', main);
                        
                        window.TrackGO = { 
                            addFbParamsToUrl: ParamManager.addFbParametersToUrl.bind(ParamManager), 
                            getParameters: ParamManager.getFbParameters.bind(ParamManager), 
                            refresh: forceRefresh, 
                            forceSync: forceRefresh,
                            generateShotgun: generateShotgunValue,
                            checkInitiateCheckout: checkCurrentPageForInitiateCheckout, 
                            fireInitiateCheckout: fireInitiateCheckout,
                            extractTargetUrl: extractTargetUrl,
                            version: '1.0.6',
                            debug: () => { 
                                console.log('TrackGO Debug v1.0.6:'); 
                                console.log('- URL atual:', window.location.search); 
                                console.log('- Última URL processada:', lastUrlParams); 
                                console.log('- Cache de parâmetros:', currentParamCache); 
                                console.log('- Inicializado:', isInitialized);             
                                console.log('- Interceptação universal ATIVA');
                                console.log('- Parâmetros ativos:', Array.from(ParamManager.getFbParameters().entries())); 
                                console.log('- TKG=IC na página atual:', hasInitiateCheckoutParam(window.location.href));
                                console.log('- Config forceUrlOverwrite:', CONFIG.forceUrlOverwrite);
                                const testButton = document.querySelector('button, [onclick], [data-url]');
                                if (testButton) { console.log('- Teste extração de URL:', testButton); console.log('  URL extraída:', extractTargetUrl(testButton)); }
                                console.log('- Cookies Facebook:', { '_fbp': getCookie('_fbp'), '_fbc': getCookie('_fbc'), 'fbclid': getCookie('fbclid') });
                                console.log('- Cookies Shotgun:', { 'fbp': getCookie('fbp'), 'fbc': getCookie('fbc'), 'subid4': getCookie('subid4'), 'aff_sub4': getCookie('aff_sub4'), 'cid': getCookie('cid'), 'sck': getCookie('sck') });
                                const trackgoFields = document.querySelectorAll('input[data-trackgo="true"]');
                                console.log('- Campos em formulários:', Array.from(trackgoFields).map(f => f.name + '=' + f.value));
                            } 
                        };
                        console.log("TrackGO v1.0.6 carregado! Delay 3s inicial, verifica a cada 200ms, fbclid sempre gera novo _fbc"); 
                    })();
                `}
            </Script>
        </div>
    )
}
