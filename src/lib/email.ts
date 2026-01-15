import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  template_key: string
  template_name: string
  subject: string
  html_content: string
  variables: string[]
  is_active: boolean
}

interface WelcomeEmailParams {
  to: string
  name: string
  password: string
  productName: string
  loginUrl: string
}

// Buscar configurações SMTP do banco
async function getEmailSettings(): Promise<EmailSettings | null> {
  const { data, error } = await supabaseAdmin
    .from('email_settings')
    .select('*')
    .single()

  if (error || !data?.is_active) {
    return null
  }

  return data as EmailSettings
}

// Buscar template por chave
async function getEmailTemplate(templateKey: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  return data as EmailTemplate
}

// Substituir variáveis no template
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}

// Criar transporter SMTP
function createTransporter(settings: EmailSettings) {
  return nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_secure,
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password
    }
  })
}

// Enviar e-mail de boas-vindas
export async function sendWelcomeEmail({ to, name, password, productName, loginUrl }: WelcomeEmailParams) {
  try {
    // Buscar configurações SMTP
    const settings = await getEmailSettings()

    if (!settings) {
      console.log('SMTP não configurado ou inativo. Email não enviado.')
      console.log(`Email que seria enviado para: ${to}`)
      console.log(`Senha: ${password}`)
      return { success: false, error: 'SMTP não configurado' }
    }

    // Buscar template
    const template = await getEmailTemplate('welcome')

    if (!template) {
      console.log('Template "welcome" não encontrado.')
      return { success: false, error: 'Template não encontrado' }
    }

    // Preparar variáveis
    const firstName = name.split(' ')[0] || 'Cliente'
    const variables: Record<string, string> = {
      nome: firstName,
      email: to,
      senha: password,
      produto: productName,
      link: loginUrl
    }

    // Substituir variáveis
    const subject = replaceVariables(template.subject, variables)
    const htmlContent = replaceVariables(template.html_content, variables)

    // Criar transporter
    const transporter = createTransporter(settings)

    // Enviar e-mail
    const info = await transporter.sendMail({
      from: `${settings.from_name} <${settings.from_email}>`,
      to: to,
      subject: subject,
      html: htmlContent
    })

    console.log('Email enviado com sucesso:', info.messageId)
    return { success: true, id: info.messageId }

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

// Enviar e-mail genérico usando template
export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  variables: Record<string, string>
) {
  try {
    const settings = await getEmailSettings()

    if (!settings) {
      console.log('SMTP não configurado.')
      return { success: false, error: 'SMTP não configurado' }
    }

    const template = await getEmailTemplate(templateKey)

    if (!template) {
      console.log(`Template "${templateKey}" não encontrado.`)
      return { success: false, error: 'Template não encontrado' }
    }

    const subject = replaceVariables(template.subject, variables)
    const htmlContent = replaceVariables(template.html_content, variables)

    const transporter = createTransporter(settings)

    const info = await transporter.sendMail({
      from: `${settings.from_name} <${settings.from_email}>`,
      to: to,
      subject: subject,
      html: htmlContent
    })

    console.log('Email enviado:', info.messageId)
    return { success: true, id: info.messageId }

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}
