// Temporary, isolated Hostinger SMTP test. Does not touch live auth emails.
// Gated: caller must send Authorization: Bearer <LOVABLE_API_KEY>.
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import nodemailer from 'npm:nodemailer@6.9.16'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'

const ALLOWED_TO = ['samy_hussain@hotmail.co.uk', 'samyhussain123@gmail.com']

Deno.serve(async (req) => {
  const key = Deno.env.get('LOVABLE_API_KEY')
  if (!key || req.headers.get('Authorization') !== `Bearer ${key}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  const pass = Deno.env.get('HOSTINGER_SMTP_PASSWORD')
  if (!pass) return new Response(JSON.stringify({ error: 'SMTP password not set' }), { status: 500 })
  const body = await req.json().catch(() => ({}))
  const to = String(body.to ?? '')
  const port = body.port === 587 ? 587 : 465
  if (!ALLOWED_TO.includes(to)) return new Response(JSON.stringify({ error: 'Recipient not allowed' }), { status: 400 })

  const props = { siteName: 'Vydora', confirmationUrl: 'https://vydora.ai/reset-password' }
  const html = await renderAsync(React.createElement(RecoveryEmail, props))
  const text = await renderAsync(React.createElement(RecoveryEmail, props), { plainText: true })

  const transport = nodemailer.createTransport({
    host: 'smtp.hostinger.com', port, secure: port === 465, requireTLS: port === 587,
    auth: { user: 'noreply@vydora.ai', pass },
  })
  try {
    await transport.verify()
    const info = await transport.sendMail({
      from: 'Vydora <noreply@vydora.ai>', to,
      subject: 'Reset your Vydora password (Hostinger test)', html, text,
    })
    return new Response(JSON.stringify({ accepted: info.accepted, rejected: info.rejected, response: info.response, messageId: info.messageId, port }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, code: (e as any).code, port }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
})
