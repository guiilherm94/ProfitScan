'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Zap, Shield, Star, Loader2, ArrowLeft, Copy, CheckCircle,
    MessageSquare, Settings, Lock, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface StoreProfile {
    store_name: string
    store_niche: string
    store_tone: string
}

interface GeneratedResponse {
    type: string
    content: string
}

export default function BlindagemPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)
    const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null)
    const [needsSetup, setNeedsSetup] = useState(false)

    // Form state
    const [comment, setComment] = useState('')
    const [stars, setStars] = useState(3)
    const [generating, setGenerating] = useState(false)
    const [responses, setResponses] = useState<GeneratedResponse[]>([])
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    useEffect(() => {
        const initialize = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/'
                return
            }
            setUser(session.user)

            // Verificar acesso ao módulo
            const { data: access } = await supabase
                .from('reputation_access')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single()

            // Para desenvolvimento, liberar acesso por padrão
            const BYPASS_ACCESS = true
            setHasAccess(BYPASS_ACCESS || !!access)

            // Carregar perfil da loja
            const { data: profile } = await supabase
                .from('store_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single()

            if (profile) {
                setStoreProfile({
                    store_name: profile.store_name,
                    store_niche: profile.store_niche,
                    store_tone: profile.store_tone
                })
            } else {
                setNeedsSetup(true)
            }

            setLoading(false)
        }
        initialize()
    }, [])

    const handleGenerate = async () => {
        if (!comment.trim()) {
            alert('Cole o comentário do cliente')
            return
        }

        if (!storeProfile) {
            alert('Configure o perfil da loja primeiro')
            return
        }

        setGenerating(true)
        setResponses([])

        try {
            const response = await fetch('/api/generate-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment,
                    stars,
                    storeProfile
                })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            setResponses(data.responses)
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao gerar respostas. Tente novamente.')
        } finally {
            setGenerating(false)
        }
    }

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            </div>
        )
    }

    // Tela de acesso bloqueado
    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Módulo Premium</h1>
                    <p className="text-gray-400 mb-6">
                        A Blindagem de Reputação é um módulo adicional.
                        Adquira agora para ter acesso ilimitado!
                    </p>
                    <Link
                        href="/vendas"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-xl"
                    >
                        Quero Acesso
                    </Link>
                </div>
            </div>
        )
    }

    // Tela de setup necessário
    if (needsSetup) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                        <Settings className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Configure sua Loja</h1>
                    <p className="text-gray-400 mb-6">
                        Para gerar respostas personalizadas, precisamos saber mais sobre seu negócio.
                    </p>
                    <Link
                        href="/configuracoes"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
                    >
                        <Settings className="w-5 h-5" />
                        Configurar Agora
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <header className="py-4 px-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">Blindagem de Reputação</span>
                        </div>
                    </div>
                    <Link
                        href="/configuracoes"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Configurações"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Panel */}
                    <div className="space-y-6">
                        {/* Store Info */}
                        <div className="bg-[#111111] rounded-xl border border-white/10 p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{storeProfile?.store_name}</p>
                                <p className="text-gray-500 text-sm truncate">{storeProfile?.store_niche}</p>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <MessageSquare className="w-5 h-5 text-cyan-400" />
                                <h2 className="font-semibold text-white">Comentário do Cliente</h2>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all resize-none"
                                placeholder="Cole aqui a avaliação / reclamação do cliente..."
                            />
                        </div>

                        {/* Star Rating */}
                        <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <h2 className="font-semibold text-white">Nota da Avaliação</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => setStars(value)}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${value <= stars
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-700'
                                                }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-4 text-2xl font-bold text-white">{stars}/5</span>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !comment.trim()}
                            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Gerando Respostas...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    GERAR RESPOSTAS
                                </>
                            )}
                        </button>
                    </div>

                    {/* Responses Panel */}
                    <div className="space-y-4">
                        {generating && (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-[#111111] rounded-2xl border border-white/10 p-6">
                                        <div className="h-4 bg-white/10 rounded animate-pulse w-1/3 mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-white/10 rounded animate-pulse w-full"></div>
                                            <div className="h-3 bg-white/10 rounded animate-pulse w-5/6"></div>
                                            <div className="h-3 bg-white/10 rounded animate-pulse w-4/6"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!generating && responses.length === 0 && (
                            <div className="bg-[#111111] rounded-2xl border border-white/10 p-8 text-center">
                                <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-white font-semibold mb-2">Respostas Aparecerão Aqui</h3>
                                <p className="text-gray-500 text-sm">
                                    Cole o comentário, selecione as estrelas e clique em Gerar
                                </p>
                            </div>
                        )}

                        {responses.map((response, index) => (
                            <div
                                key={index}
                                className="bg-[#111111] rounded-2xl border border-white/10 p-6 relative group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${index === 0 ? 'bg-blue-500/20 text-blue-400' :
                                            index === 1 ? 'bg-green-500/20 text-green-400' :
                                                'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {response.type}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(response.content, index)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copiedIndex === index ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {response.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
