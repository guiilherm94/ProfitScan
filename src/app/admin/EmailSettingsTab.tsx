'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Eye, RefreshCw, Plus, CheckCircle, AlertCircle } from 'lucide-react'

interface EmailSettings {
    smtp_host: string
    smtp_port: number
    smtp_secure: boolean
    smtp_user: string
    smtp_password: string
    from_email: string
    from_name: string
    is_active: boolean
}

interface EmailTemplate {
    id: string
    template_key: string
    template_name: string
    subject: string
    html_content: string
    variables: string[]
    is_active: boolean
}

export default function EmailSettingsTab() {
    const [settings, setSettings] = useState<EmailSettings>({
        smtp_host: 'smtp.hostinger.com',
        smtp_port: 465,
        smtp_secure: true,
        smtp_user: '',
        smtp_password: '',
        from_email: '',
        from_name: 'ProfitScan AI',
        is_active: false
    })
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testEmail, setTestEmail] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        fetchSettings()
        fetchTemplates()
    }, [])

    async function fetchSettings() {
        try {
            const res = await fetch('/api/admin/email/settings')
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            }
        } catch (error) {
            console.error('Erro ao buscar configurações:', error)
        }
    }

    async function fetchTemplates() {
        try {
            const res = await fetch('/api/admin/email/templates')
            if (res.ok) {
                const data = await res.json()
                setTemplates(data)
                if (data.length > 0) {
                    setSelectedTemplate(data[0].template_key)
                    setCurrentTemplate(data[0])
                }
            }
        } catch (error) {
            console.error('Erro ao buscar templates:', error)
        } finally {
            setLoading(false)
        }
    }

    async function saveSettings() {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/admin/email/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Configurações salvas!' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Erro ao salvar' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao conectar' })
        } finally {
            setSaving(false)
        }
    }

    async function testConnection() {
        setTesting(true)
        setMessage(null)
        try {
            const res = await fetch('/api/admin/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...settings,
                    test_email: testEmail || undefined
                })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message })
            } else {
                setMessage({ type: 'error', text: data.error })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao testar conexão' })
        } finally {
            setTesting(false)
        }
    }

    async function saveTemplate() {
        if (!currentTemplate) return
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/admin/email/templates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_key: currentTemplate.template_key,
                    subject: currentTemplate.subject,
                    html_content: currentTemplate.html_content,
                    is_active: currentTemplate.is_active
                })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Template salvo!' })
                fetchTemplates()
            } else {
                setMessage({ type: 'error', text: data.error || 'Erro ao salvar' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao conectar' })
        } finally {
            setSaving(false)
        }
    }

    function selectTemplate(key: string) {
        setSelectedTemplate(key)
        const template = templates.find(t => t.template_key === key)
        setCurrentTemplate(template || null)
    }

    function getPreviewHtml() {
        if (!currentTemplate) return ''
        let html = currentTemplate.html_content
        // Substituir variáveis por exemplos
        html = html.replace(/{{nome}}/g, 'João')
        html = html.replace(/{{email}}/g, 'joao@exemplo.com')
        html = html.replace(/{{senha}}/g, 'senha123')
        html = html.replace(/{{produto}}/g, 'ProfitScan 360º')
        html = html.replace(/{{link}}/g, 'https://profitscan.ai/login')
        return html
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Mensagem de feedback */}
            {message && (
                <div className={`flex items-center gap-2 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Configurações SMTP */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Configurações SMTP</h2>
                        <p className="text-sm text-gray-500">Configure seu servidor de e-mail (Hostinger, Gmail, etc.)</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-gray-400">Ativo</span>
                        <button
                            onClick={() => setSettings({ ...settings, is_active: !settings.is_active })}
                            className={`w-12 h-6 rounded-full transition-colors ${settings.is_active ? 'bg-green-500' : 'bg-gray-700'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Host SMTP</label>
                        <input
                            type="text"
                            value={settings.smtp_host}
                            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                            placeholder="smtp.hostinger.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Porta</label>
                        <input
                            type="number"
                            value={settings.smtp_port}
                            onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Usuário (E-mail)</label>
                        <input
                            type="email"
                            value={settings.smtp_user}
                            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                            placeholder="contato@seudominio.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Senha</label>
                        <input
                            type="password"
                            value={settings.smtp_password}
                            onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">E-mail Remetente</label>
                        <input
                            type="email"
                            value={settings.from_email}
                            onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                            placeholder="noreply@seudominio.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Nome Remetente</label>
                        <input
                            type="text"
                            value={settings.from_name}
                            onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                            placeholder="ProfitScan AI"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input
                            type="checkbox"
                            checked={settings.smtp_secure}
                            onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.checked })}
                            className="rounded bg-gray-800 border-gray-700"
                        />
                        Conexão segura (SSL/TLS)
                    </label>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-800">
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="px-4 py-2 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>

                    <div className="flex items-center gap-2">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 w-64"
                            placeholder="E-mail para teste (opcional)"
                        />
                        <button
                            onClick={testConnection}
                            disabled={testing}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            {testing ? 'Testando...' : 'Testar Conexão'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Templates de E-mail */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Templates de E-mail</h2>
                        <p className="text-sm text-gray-500">Personalize o conteúdo dos e-mails enviados</p>
                    </div>
                </div>

                {templates.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>Nenhum template encontrado.</p>
                        <p className="text-sm mt-2">Execute o script SQL para criar os templates.</p>
                    </div>
                ) : (
                    <>
                        {/* Seletor de template */}
                        <div className="mb-4">
                            <label className="text-sm text-gray-400 block mb-1">Selecionar Template</label>
                            <select
                                value={selectedTemplate}
                                onChange={(e) => selectTemplate(e.target.value)}
                                className="w-full md:w-auto bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                            >
                                {templates.map(t => (
                                    <option key={t.template_key} value={t.template_key}>
                                        {t.template_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {currentTemplate && (
                            <div className="space-y-4">
                                {/* Variáveis disponíveis */}
                                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <p className="text-sm text-blue-400 mb-1">Variáveis disponíveis:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentTemplate.variables?.map(v => (
                                            <code key={v} className="px-2 py-1 bg-[#0a0a0a] rounded text-xs text-green-400">
                                                {`{{${v}}}`}
                                            </code>
                                        ))}
                                    </div>
                                </div>

                                {/* Assunto */}
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Assunto do E-mail</label>
                                    <input
                                        type="text"
                                        value={currentTemplate.subject}
                                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2"
                                    />
                                </div>

                                {/* Conteúdo HTML */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-sm text-gray-400">Conteúdo HTML</label>
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={currentTemplate.html_content}
                                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, html_content: e.target.value })}
                                        className="w-full h-64 bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2 font-mono text-sm"
                                    />
                                </div>

                                {/* Preview */}
                                {showPreview && (
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1">Preview</label>
                                        <div className="border border-gray-800 rounded-lg overflow-hidden">
                                            <iframe
                                                srcDoc={getPreviewHtml()}
                                                className="w-full h-96 bg-white"
                                                title="Preview do E-mail"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Botões */}
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                                    <button
                                        onClick={saveTemplate}
                                        disabled={saving}
                                        className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-50"
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Template'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
