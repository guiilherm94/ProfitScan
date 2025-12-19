'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Zap, TrendingUp, Shield, Loader2, Mail, Lock, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/dashboard'
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage({ type: 'success', text: 'Confira seu email para confirmar o cadastro!' })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Digite seu email primeiro' })
      return
    }
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setMessage({ type: 'success', text: 'Magic Link enviado! Confira seu email.' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Hero Header */}
      <header className="py-6 px-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">ProfitScan<span className="text-[#00ff88]">AI</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Value Proposition */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20">
                <Sparkles className="w-4 h-4 text-[#00ff88]" />
                <span className="text-sm text-[#00ff88] font-medium">Powered by GPT-4</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Descubra se seu produto está dando{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00d4ff]">
                  lucro real
                </span>
              </h1>
              <p className="text-lg text-gray-400 max-w-md">
                O detector de lucro oculto para MEIs. Insira seus custos e deixe a I.A. revelar a verdade sobre sua margem.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <TrendingUp className="w-8 h-8 text-[#00ff88] mb-3" />
                <h3 className="font-semibold text-white mb-1">Análise Instantânea</h3>
                <p className="text-sm text-gray-500">Cálculos em tempo real</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Zap className="w-8 h-8 text-[#00d4ff] mb-3" />
                <h3 className="font-semibold text-white mb-1">Consultor I.A.</h3>
                <p className="text-sm text-gray-500">Dicas personalizadas</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Shield className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold text-white mb-1">Histórico Salvo</h3>
                <p className="text-sm text-gray-500">Suas análises seguras</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="relative">
              {/* Glowing Border Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-purple-500 rounded-2xl opacity-20 blur-sm"></div>

              <div className="relative bg-[#111111] rounded-2xl p-8 border border-white/10">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                  </h2>
                  <p className="text-gray-500">
                    {isLogin ? 'Entre para continuar analisando' : 'Comece a detectar seu lucro real'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'error'
                        ? 'bg-[#ff3355]/10 text-[#ff3355] border border-[#ff3355]/20'
                        : 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                      }`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      isLogin ? 'Entrar' : 'Criar Conta'
                    )}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#111111] text-gray-500">ou</span>
                  </div>
                </div>

                <button
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Enviar Magic Link
                </button>

                <p className="text-center text-gray-500 text-sm mt-6">
                  {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#00ff88] hover:underline font-medium"
                  >
                    {isLogin ? 'Criar conta' : 'Fazer login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          © 2025 ProfitScan AI. Feito para MEIs que querem lucrar de verdade.
        </div>
      </footer>
    </div>
  )
}
