'use client'

import { useState } from 'react'
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
                        href="https://vitrinego.mycartpanda.com/checkout/204999344:1"
                        target="_blank"
                        rel="noopener noreferrer"
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
                        href="https://vitrinego.mycartpanda.com/checkout/204999344:1"
                        target="_blank"
                        rel="noopener noreferrer"
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

                        <div className="flex items-center gap-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                <FileText className="w-4 h-4" /> Política de Privacidade
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                <FileText className="w-4 h-4" /> Termos de Uso
                            </a>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-600 space-y-2">
                        <p>
                            Este site não é afiliado ao Facebook ou a qualquer entidade do Facebook.
                            Depois que você sair do Facebook, a responsabilidade não é deles e sim do nosso site.
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <Mail className="w-3 h-3" /> suporte@profitscan.ai
                        </p>
                        <p>CNPJ: 00.000.000/0001-00 | © 2025 ProfitScan AI. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
