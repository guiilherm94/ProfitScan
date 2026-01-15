'use client'

import { Mail, CheckCircle, Inbox, Sparkles, LogIn, Key, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

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
                        Seu acesso ao <span className="text-green-400 font-semibold">ProfitScan AI</span> está liberado
                    </p>
                </div>

                {/* Card Principal */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    {/* Credenciais de Acesso - Destacado */}
                    <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-green-500/20 to-cyan-500/10 border border-green-500/30 rounded-xl mb-6">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <Key className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3">Suas Credenciais de Acesso</h2>
                        <div className="w-full space-y-3">
                            <div className="bg-black/30 rounded-lg p-3">
                                <p className="text-gray-400 text-sm">E-mail:</p>
                                <p className="text-white font-medium">O mesmo usado na compra</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3">
                                <p className="text-gray-400 text-sm">Senha:</p>
                                <p className="text-green-400 font-bold text-lg font-mono">senha123</p>
                            </div>
                        </div>
                    </div>

                    {/* Aviso de Segurança */}
                    <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-400 font-semibold text-sm">Importante!</p>
                            <p className="text-gray-300 text-sm">
                                Após o primeiro login, vá em <span className="text-white font-medium">Configurações</span> e troque sua senha por uma segura.
                            </p>
                        </div>
                    </div>

                    {/* Steps */}
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Como acessar:</h3>
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 font-bold text-sm">1</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Clique no botão abaixo</p>
                                <p className="text-gray-400 text-sm">Você será redirecionado para a página de login</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 font-bold text-sm">2</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Use seu e-mail da compra</p>
                                <p className="text-gray-400 text-sm">E a senha padrão: <span className="text-green-400 font-mono">senha123</span></p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 font-bold text-sm">3</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Troque a senha</p>
                                <p className="text-gray-400 text-sm">Vá em Configurações e defina uma senha segura</p>
                            </div>
                        </div>
                    </div>

                    {/* Botão de Login */}
                    <Link
                        href="/login"
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
                    >
                        <LogIn className="w-5 h-5" />
                        Acessar Minha Conta
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-6"></div>

                    {/* Tip */}
                    <div className="flex items-start gap-3 text-sm">
                        <Inbox className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-400">
                            <span className="text-cyan-400 font-medium">Dica:</span> Também enviamos um e-mail de confirmação. Verifique sua caixa de entrada ou <span className="text-white">spam</span>.
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
