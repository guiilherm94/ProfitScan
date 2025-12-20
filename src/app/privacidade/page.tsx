'use client'

import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacidadePage() {
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
                        <Shield className="w-5 h-5 text-[#00ff88]" />
                        <span className="text-lg font-bold text-white">Política de Privacidade</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-400 text-sm mb-8">Última atualização: Dezembro de 2025</p>

                    <p className="text-gray-300 leading-relaxed mb-6">
                        A sua privacidade é importante para nós. É política do ProfitScan I.A. respeitar a sua privacidade
                        em relação a qualquer informação sua que possamos coletar no site ProfitScan I.A., e outros sites
                        que possuímos e operamos.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">1. INFORMAÇÕES QUE COLETAMOS</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço.
                        Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                        <li><strong className="text-white">Dados de Cadastro:</strong> Nome, e-mail e telefone para criação de conta e acesso ao sistema.</li>
                        <li><strong className="text-white">Dados de Uso:</strong> Informações sobre como você interage com nosso software para melhoria contínua.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">2. USO DE DADOS</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">Utilizamos seus dados para:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                        <li>Fornecer acesso ao sistema contratado.</li>
                        <li>Processar pagamentos via gateway seguro (Cartpanda/Kiwify).</li>
                        <li>Enviar atualizações importantes sobre o produto.</li>
                        <li>Melhorar nossos algoritmos de Inteligência Artificial (de forma anonimizada).</li>
                    </ul>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">3. COOKIES E RASTREAMENTO (PIXEL)</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Utilizamos cookies e tecnologias de rastreamento (como o Pixel do Facebook e Google Analytics)
                        para analisar o tráfego e personalizar anúncios. Ao utilizar nosso site, você concorda com o uso
                        dessas tecnologias para fins de marketing e melhoria de experiência.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">4. COMPARTILHAMENTO DE DADOS</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Não compartilhamos informações de identificação pessoal publicamente ou com terceiros,
                        exceto quando exigido por lei ou para processamento de pagamentos (Gateway).
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">5. SEUS DIREITOS (LGPD)</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez
                        não possamos fornecer alguns dos serviços desejados. Você tem direito a solicitar a exclusão
                        dos seus dados a qualquer momento entrando em contato com nosso suporte.
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
