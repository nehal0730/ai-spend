import { z } from 'zod'

export type LeadCaptureMode = 'lead' | 'report' | 'contact'

export type LeadCaptureSource = 'landing_page' | 'audit_page' | 'audit_results' | 'share_page' | 'contact_widget'

export interface LeadCaptureContext {
  email: string
  company?: string
  role?: string
  teamSize?: number
  source: LeadCaptureSource
  message?: string
  shareId?: string
  reportTitle?: string
  reportUrl?: string
  honeypot?: string
  startedAt?: string
}

export interface LeadCaptureSuccess {
  leadId: string
  status: 'created' | 'updated' | 'deduped'
  message: string
  emailSent: boolean
  emailEventId?: string
  reportRequestId?: string
}

export interface LeadCaptureApiEnvelope {
  success: true
  data: LeadCaptureSuccess
}

export interface LeadCaptureApiError {
  success?: false
  error: string
  issues?: Array<{ message: string }>
}

const emailSchema = z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase())

const optionalText = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return undefined
    // eslint-disable-next-line no-control-regex
    const normalized = value.replace(/\u0000/g, '').trim()
    return normalized.length > 0 ? normalized : undefined
  }, z.string().max(maxLength).optional())

export function createLeadCaptureSchema(mode: LeadCaptureMode) {
  return z.object({
    email: emailSchema,
    company: optionalText(120),
    role: optionalText(120),
    teamSize: z.coerce.number().int().min(1).max(100000).optional(),
    message: mode === 'contact' ? z.string().trim().min(10, 'Add a short note so we can help').max(2000) : optionalText(2000),
    source: z.enum(['landing_page', 'audit_page', 'audit_results', 'share_page', 'contact_widget']),
    shareId: mode === 'report' ? z.string().trim().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/).optional() : optionalText(64),
    reportTitle: optionalText(160),
    reportUrl: z.preprocess((value) => {
      if (typeof value !== 'string') return undefined
      const normalized = value.trim()
      return normalized.length > 0 ? normalized : undefined
    }, z.string().url().optional()),
    honeypot: optionalText(0),
    startedAt: z.string().datetime().optional()
  })
}

export type LeadCaptureFormValues = z.infer<ReturnType<typeof createLeadCaptureSchema>>
