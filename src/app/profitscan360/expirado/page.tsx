'use client'

import { PieChart, Clock, RefreshCw, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AcessoExpiradoPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card principal */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
                    {/* Ícone */}
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-orange-400" />
                    </div>

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-bold text-white text-xl">ProfitScan</span>
                        <span className="text-orange-400 font-bold text-xl">360º</span>
                    </div>

                    {/* Mensagem */}
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Seu acesso expirou
                    </h1>
                    <p className="text-gray-400 mb-6">
                        O período de 1 ano do seu ProfitScan 360º chegou ao fim.
                        Para continuar utilizando todas as funcionalidades, renove seu acesso.
                    </p>

                    {/* Aviso */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-yellow-400 text-sm text-left">
                                Seus dados continuam salvos! Ao renovar, você terá acesso a todos os seus produtos, ingredientes e configurações.
                            </p>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="space-y-3">
                        <a
                            href="https://vitrinego.mycartpanda.com/profitscan-360-renovacao"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Renovar por R$ 97/ano
                        </a>

                        <a
                            href="https://vitrinego.mycartpanda.com/profitscan-360-mensal"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors"
                        >
                            Ou R$ 9,90/mês
                        </a>
                    </div>

                    {/* Link para dashboard */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-400">
                            ← Voltar ao Dashboard
                        </Link>
                    </div>
                </div>

                {/* Nota de suporte */}
                <p className="text-center text-gray-600 text-xs mt-4">
                    Dúvidas? Entre em contato pelo suporte.
                </p>
            </div>
        </div>
    )
}
