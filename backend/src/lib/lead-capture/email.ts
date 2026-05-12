import { Resend } from 'resend'
import { randomUUID } from 'crypto'
import { getOptionalEnv, getRequiredEnv } from '../env'

type EmailPayload = {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = getOptionalEnv('RESEND_API_KEY')
  if (!apiKey) {
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

export function getTransactionalFromAddress(): string {
  return getOptionalEnv('RESEND_FROM_EMAIL') || 'AI Spend Audit <no-reply@aispendaudit.com>'
}

export function getSupportEmail(): string {
  return getOptionalEnv('SUPPORT_EMAIL') || 'support@aispendaudit.com'
}

export function getConsultationUrl(): string {
  return getOptionalEnv('CONSULTATION_URL') || getOptionalEnv('APP_URL') || getRequiredEnv('FRONTEND_BASE_URL')
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<{ providerMessageId: string | null; skipped: boolean }> {
  const client = getResendClient()

  if (!client) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not configured')
    }

    console.warn(`[email:mock] ${payload.subject} -> ${payload.to}`)
    return { providerMessageId: `dev-mock-${randomUUID()}`, skipped: true }
  }

  const response = await client.emails.send({
    from: getTransactionalFromAddress(),
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo || getSupportEmail()
  })

  if (response.error) {
    throw new Error(response.error.message)
  }

  return {
    providerMessageId: response.data?.id ?? null,
    skipped: false
  }
}
