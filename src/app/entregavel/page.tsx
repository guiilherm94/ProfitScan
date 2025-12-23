'use client'

import { Mail, CheckCircle, Inbox, Sparkles } from 'lucide-react'

export default function EntregavelPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 mb-6">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Compra Confirmada! 🎉
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Seu acesso ao <span className="text-green-400 font-semibold">ProfitScan AI</span> está quase pronto
                    </p>
                </div>

                {/* Card Principal */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    {/* Email Alert - Destacado */}
                    <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-green-500/20 to-cyan-500/10 border border-green-500/30 rounded-xl mb-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Verifique seu e-mail agora!</h2>
                        <p className="text-gray-300">
                            Enviamos suas credenciais de acesso para o e-mail usado na compra.
                        </p>
                    </div>

                    {/* Steps */}
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Próximos passos:</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 font-bold text-sm">1</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Abra seu e-mail</p>
                                <p className="text-gray-400 text-sm">Procure por "ProfitScan AI" na caixa de entrada ou spam</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 font-bold text-sm">2</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Confirme seu e-mail</p>
                                <p className="text-gray-400 text-sm">Clique no botão de confirmação dentro do e-mail</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 font-bold text-sm">3</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Acesse com sua senha</p>
                                <p className="text-gray-400 text-sm">A senha de acesso está no e-mail que enviamos</p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-6"></div>

                    {/* Tip */}
                    <div className="flex items-start gap-3 text-sm">
                        <Inbox className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-400">
                            <span className="text-yellow-400 font-medium">Dica:</span> Se não encontrar o e-mail, verifique a pasta de <span className="text-white">spam</span> ou <span className="text-white">promoções</span>.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-400 text-sm">Obrigado por escolher o ProfitScan AI</span>
                    </div>
                </div>

                <p className="text-center text-gray-600 text-xs mt-4">
                    Problemas? Fale conosco: molivesutter@gmail.com
                </p>
            </div>
        </div>
    )
}
