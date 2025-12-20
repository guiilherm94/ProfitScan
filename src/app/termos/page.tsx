'use client'

import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermosPage() {
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
                        <FileText className="w-5 h-5 text-[#00ff88]" />
                        <span className="text-lg font-bold text-white">Termos de Uso</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-400 text-sm mb-8">Última atualização: Dezembro de 2025</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">1. ACEITAÇÃO DOS TERMOS</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Ao acessar e usar o software ProfitScan I.A., você concorda em cumprir estes termos de serviço,
                        todas as leis e regulamentos aplicáveis. Se você não concordar com algum desses termos,
                        está proibido de usar ou acessar este site.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">2. LICENÇA DE USO</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        É concedida permissão para acessar o software ProfitScan I.A. para uso pessoal e comercial
                        no seu próprio negócio. Esta é a concessão de uma licença, não uma transferência de título.
                        Sob esta licença, você não pode:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                        <li>Modificar, copiar ou tentar fazer engenharia reversa do software;</li>
                        <li>Revender, sublicenciar ou alugar o acesso a terceiros;</li>
                        <li>Usar o software para qualquer finalidade ilegal ou não autorizada.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">3. POLÍTICA DE ACESSO VITALÍCIO</h2>
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6">
                        <p className="text-yellow-200 leading-relaxed">
                            O termo "Acesso Vitalício" refere-se à garantia de acesso ao software enquanto o produto
                            estiver disponível comercialmente e tecnicamente ativo (Lifetime of the Product).
                        </p>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        O ProfitScan I.A. reserva-se o direito de descontinuar o serviço a qualquer momento,
                        mediante aviso prévio de 30 (trinta) dias, sem obrigatoriedade de reembolso após o período de garantia legal.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">4. POLÍTICA DE USO JUSTO (FAIR USE)</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">Para garantir a estabilidade do sistema:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                        <li><strong className="text-green-400">ProfitScan (Calculadora):</strong> Uso ilimitado.</li>
                        <li><strong className="text-cyan-400">Ferramentas de I.A. Generativa (Ex: Respostas, Textos):</strong> Limitado a 50 gerações por dia por usuário para evitar abusos automatizados.</li>
                    </ul>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                        <p className="text-red-300 text-sm">
                            ⚠️ O uso excessivo ou automatizado pode resultar em suspensão temporária ou permanente do acesso.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">5. LIMITAÇÃO DE RESPONSABILIDADE</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        O ProfitScan I.A. é uma ferramenta de auxílio à decisão. Os resultados financeiros dependem
                        exclusivamente da gestão do usuário. <strong className="text-white">Não garantimos lucros e não nos
                            responsabilizamos por prejuízos decorrentes do uso da ferramenta.</strong>
                    </p>

                    <div className="mt-12 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">
                            <strong className="text-white">Contato:</strong> molivesutter@gmail.com
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
