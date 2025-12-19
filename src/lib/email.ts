import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WelcomeEmailParams {
    to: string
    name: string
    password: string
    productName: string
    loginUrl: string
}

export async function sendWelcomeEmail({ to, name, password, productName, loginUrl }: WelcomeEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.log('RESEND_API_KEY não configurada. Email não enviado.')
        console.log(`Email que seria enviado para: ${to}`)
        console.log(`Senha: ${password}`)
        return { success: false, error: 'API key não configurada' }
    }

    const firstName = name.split(' ')[0] || 'Cliente'

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'ProfitScan AI <noreply@profitscan.ai>',
            to: [to],
            subject: `🎉 Seu acesso ao ${productName} está liberado!`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #00ff88, #00d4ff); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 20px;">⚡</span>
                </div>
                <span style="font-size: 24px; font-weight: bold; color: white;">ProfitScan<span style="color: #00ff88;">AI</span></span>
              </div>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 40px;">
                    <!-- Welcome -->
                    <h1 style="color: white; font-size: 28px; margin: 0 0 10px 0; text-align: center;">
                      🎉 Parabéns, ${firstName}!
                    </h1>
                    <p style="color: #888; font-size: 16px; margin: 0 0 30px 0; text-align: center;">
                      Seu acesso ao <strong style="color: #00ff88;">${productName}</strong> está liberado!
                    </p>
                    
                    <!-- Credentials Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 12px; margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 24px;">
                          <p style="color: #888; font-size: 14px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
                            Seus dados de acesso:
                          </p>
                          
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #666; font-size: 14px;">Email:</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: white; font-size: 14px; font-weight: 600;">${to}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #666; font-size: 14px;">Senha:</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <code style="background-color: #222; color: #00ff88; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;">${password}</code>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #00ff88, #00d4ff); color: black; font-weight: bold; font-size: 16px; padding: 16px 40px; border-radius: 12px; text-decoration: none;">
                            ACESSAR AGORA →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Security Note -->
                    <p style="color: #666; font-size: 12px; margin: 30px 0 0 0; text-align: center;">
                      🔒 Recomendamos que você altere sua senha após o primeiro acesso.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 0; text-align: center;">
              <p style="color: #444; font-size: 12px; margin: 0;">
                Este email foi enviado porque você adquiriu o ${productName}.<br>
                Se não foi você, ignore este email.
              </p>
              <p style="color: #333; font-size: 11px; margin: 16px 0 0 0;">
                © 2025 ProfitScan AI. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
        })

        if (error) {
            console.error('Erro ao enviar email:', error)
            return { success: false, error }
        }

        console.log('Email enviado com sucesso:', data?.id)
        return { success: true, id: data?.id }

    } catch (error) {
        console.error('Erro ao enviar email:', error)
        return { success: false, error }
    }
}
