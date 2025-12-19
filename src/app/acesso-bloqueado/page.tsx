'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Zap, Lock, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AcessoBloqueadoPage() {
    const [email, setEmail] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user?.email) {
                setEmail(session.user.email)
            }
            setLoading(false)
        }
        checkSession()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
                        <Zap className="w-7 h-7 text-black" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-bold text-white">ProfitScan<span className="text-[#00ff88]">AI</span></span>
                </div>

                {/* Card */}
                <div className="bg-[#111] rounded-2xl border border-white/10 p-8">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-yellow-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">
                        Acesso Restrito
                    </h1>

                    <p className="text-gray-400 mb-6">
                        {email ? (
                            <>
                                O email <span className="text-white font-medium">{email}</span> ainda não possui acesso ao ProfitScan AI.
                            </>
                        ) : (
                            'Você precisa adquirir o acesso para usar a ferramenta.'
                        )}
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/vendas"
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            QUERO MEU ACESSO
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <Link
                            href="/"
                            className="w-full block py-3 px-6 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            Voltar para a página inicial
                        </Link>
                    </div>
                </div>

                <p className="text-gray-600 text-sm mt-6">
                    Já comprou? O acesso é liberado automaticamente.<br />
                    Se tiver problemas, entre em contato com o suporte.
                </p>
            </div>
        </div>
    )
}
