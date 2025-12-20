'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Zap, Store, Save, Loader2, ArrowLeft, CheckCircle,
    Sparkles, Lock, Eye, EyeOff
} from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface StoreProfile {
    store_name: string
    store_niche: string
    store_tone: string
}

const TONE_OPTIONS = [
    'Profissional e Empático',
    'Descontraído e Jovem',
    'Sério e Tradicional',
    'Amigável e Próximo',
    'Sofisticado e Premium'
]

const NICHE_SUGGESTIONS = [
    'Pizzaria Delivery',
    'Hamburgueria Artesanal',
    'Loja de Roupas Femininas',
    'Barbearia',
    'Salão de Beleza',
    'Pet Shop',
    'Açaíteria',
    'Doceria e Confeitaria',
    'Restaurante',
    'Loja de Calçados'
]

export default function ConfiguracoesPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [profile, setProfile] = useState<StoreProfile>({
        store_name: '',
        store_niche: '',
        store_tone: 'Profissional e Empático'
    })

    // Password change state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordSaved, setPasswordSaved] = useState(false)
    const [passwordError, setPasswordError] = useState('')

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/'
                return
            }
            setUser(session.user)

            // Carregar perfil existente
            const { data } = await supabase
                .from('store_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single()

            if (data) {
                setProfile({
                    store_name: data.store_name,
                    store_niche: data.store_niche,
                    store_tone: data.store_tone || 'Profissional e Empático'
                })
            }

            setLoading(false)
        }
        loadProfile()
    }, [])

    const handleSave = async () => {
        if (!user || !profile.store_name || !profile.store_niche) {
            alert('Preencha o nome e nicho da loja')
            return
        }

        setSaving(true)
        setSaved(false)

        try {
            const { error } = await supabase
                .from('store_profiles')
                .upsert({
                    user_id: user.id,
                    store_name: profile.store_name,
                    store_niche: profile.store_niche,
                    store_tone: profile.store_tone,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (error) throw error

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar perfil')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        setPasswordError('')

        if (newPassword.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('As senhas não coincidem')
            return
        }

        setPasswordSaving(true)
        setPasswordSaved(false)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setPasswordSaved(true)
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setPasswordSaved(false), 3000)
        } catch (error) {
            console.error('Erro ao trocar senha:', error)
            setPasswordError('Erro ao trocar senha. Tente novamente.')
        } finally {
            setPasswordSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <header className="py-4 px-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
                                <Zap className="w-5 h-5 text-black" strokeWidth={2.5} />
                            </div>
                            <span className="text-lg font-bold text-white">Configurações</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Store Profile Card */}
                <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Store className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Perfil da Loja</h1>
                            <p className="text-sm text-gray-500">Configure sua loja para respostas personalizadas</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Store Name */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Nome da Loja *
                            </label>
                            <input
                                type="text"
                                value={profile.store_name}
                                onChange={(e) => setProfile({ ...profile, store_name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all"
                                placeholder="Ex: Pizzaria do Zé, Barbearia Style..."
                            />
                        </div>

                        {/* Store Niche */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Nicho / Segmento *
                            </label>
                            <input
                                type="text"
                                value={profile.store_niche}
                                onChange={(e) => setProfile({ ...profile, store_niche: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all"
                                placeholder="Ex: Pizzaria Delivery Artesanal"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {NICHE_SUGGESTIONS.slice(0, 5).map((niche) => (
                                    <button
                                        key={niche}
                                        onClick={() => setProfile({ ...profile, store_niche: niche })}
                                        className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                                    >
                                        {niche}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Store Tone */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Tom de Comunicação
                            </label>
                            <select
                                value={profile.store_tone}
                                onChange={(e) => setProfile({ ...profile, store_tone: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all appearance-none cursor-pointer"
                            >
                                {TONE_OPTIONS.map((tone) => (
                                    <option key={tone} value={tone} className="bg-[#111] text-white">
                                        {tone}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-cyan-300 font-medium">Por que isso é importante?</p>
                                    <p className="text-sm text-cyan-400/70 mt-1">
                                        A I.A. usa essas informações para gerar respostas personalizadas com termos técnicos
                                        do seu nicho e no tom certo para sua marca.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving || !profile.store_name || !profile.store_niche}
                            className="w-full py-4 px-6 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Salvando...
                                </>
                            ) : saved ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Salvo com Sucesso!
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Salvar Perfil
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8 mt-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Alterar Senha</h2>
                            <p className="text-sm text-gray-500">Troque sua senha de acesso</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Nova Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                                placeholder="Repita a nova senha"
                            />
                        </div>

                        {/* Error Message */}
                        {passwordError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400">{passwordError}</p>
                            </div>
                        )}

                        {/* Change Password Button */}
                        <button
                            onClick={handlePasswordChange}
                            disabled={passwordSaving || !newPassword || !confirmPassword}
                            className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {passwordSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Atualizando...
                                </>
                            ) : passwordSaved ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Senha Alterada!
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Alterar Senha
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
