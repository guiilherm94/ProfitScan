'use client'

import Link from 'next/link'
import { ArrowLeft, RefreshCcw, CheckCircle, Clock, Mail } from 'lucide-react'

export default function ReembolsoPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <header className="py-4 px-4 border-b border-white/5">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link
                        href="/vendas"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <RefreshCcw className="w-5 h-5 text-[#00ff88]" />
                        <span className="text-lg font-bold text-white">Política de Reembolso</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="prose prose-invert prose-sm max-w-none">

                    {/* Garantia Highlight */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 mb-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Garantia Incondicional de 7 Dias</h2>
                        <p className="text-gray-300">
                            Se você não estiver satisfeito com o ProfitScan I.A. por qualquer motivo,
                            você pode solicitar o reembolso total do valor pago.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        PRAZO DE GARANTIA
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Oferecemos uma <strong className="text-green-400">garantia incondicional de 7 dias</strong>.
                        Isso significa que você pode testar o produto completamente e, se por qualquer motivo não
                        ficar satisfeito, receberá 100% do seu dinheiro de volta.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-cyan-400" />
                        COMO SOLICITAR
                    </h2>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Para solicitar o reembolso, envie um e-mail para:
                        </p>
                        <a
                            href="mailto:molivesutter@gmail.com"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-[#00ff88] font-medium hover:bg-[#00ff88]/20 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            molivesutter@gmail.com
                        </a>
                        <p className="text-gray-400 text-sm mt-4">
                            Inclua o número do pedido ou CPF utilizado na compra. O estorno será processado
                            imediatamente pela plataforma de pagamento e devolvido ao seu cartão ou conta bancária.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">APÓS OS 7 DIAS</h2>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                        <p className="text-red-300 leading-relaxed">
                            Após o período de 7 dias, <strong>não serão aceitos pedidos de reembolso</strong>,
                            visto que o produto é digital e o acesso já foi consumido.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">INFORMAÇÕES IMPORTANTES</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                        <li>O prazo de 7 dias começa a contar a partir da data da compra.</li>
                        <li>Reembolsos são processados em até 7 dias úteis.</li>
                        <li>O valor será estornado na mesma forma de pagamento utilizada.</li>
                        <li>Após o reembolso, seu acesso ao sistema será revogado.</li>
                    </ul>

                    <div className="mt-12 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">
                            <strong className="text-white">Dúvidas?</strong> Entre em contato: molivesutter@gmail.com
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
