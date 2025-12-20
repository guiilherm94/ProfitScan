'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function AvisoLegalPage() {
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
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-lg font-bold text-white">Aviso Legal (Disclaimer)</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="prose prose-invert prose-sm max-w-none">

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">ISENÇÃO DE RESPONSABILIDADE DE GANHOS</h2>
                    <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-8">
                        <p className="text-yellow-100 leading-relaxed">
                            Os produtos e serviços vendidos por ProfitScan I.A. <strong>não devem ser interpretados como uma
                                promessa ou garantia de ganhos</strong>. Seu nível de sucesso em alcançar os resultados divulgados
                            com o uso de nossos produtos e informações depende do tempo que você dedica ao programa, ideias
                            e técnicas mencionadas, seu conhecimento e habilidades comerciais.
                        </p>
                        <p className="text-yellow-200 leading-relaxed mt-4">
                            Como esses fatores diferem entre cada indivíduo, <strong>não podemos garantir o seu sucesso
                                ou nível de renda</strong>.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">NATUREZA DA FERRAMENTA</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        O ProfitScan I.A. é uma ferramenta de <strong className="text-white">auxílio à tomada de decisão</strong>.
                        Os cálculos de margem, lucro e prejuízo são baseados nas informações fornecidas pelo próprio usuário.
                        A responsabilidade pela veracidade dos dados e pela aplicação das sugestões é exclusivamente do usuário.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">RESULTADOS DA INTELIGÊNCIA ARTIFICIAL</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        As respostas geradas pela I.A. são sugestões baseadas em padrões e não constituem consultoria
                        profissional financeira, contábil ou jurídica. Recomendamos sempre consultar profissionais
                        especializados para decisões críticas do seu negócio.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">VÍNCULO COM O FACEBOOK</h2>
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                        <p className="text-blue-200 leading-relaxed text-sm">
                            Este site <strong>não faz parte do site do Facebook ou da Meta Platforms, Inc.</strong>
                            Além disso, este site NÃO é endossado pelo Facebook de nenhuma maneira.
                            FACEBOOK é uma marca comercial da META PLATFORMS, INC.
                        </p>
                    </div>

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
