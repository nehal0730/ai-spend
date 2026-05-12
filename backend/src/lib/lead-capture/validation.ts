import { z } from 'zod'
import type { LeadSource } from './types'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function sanitizeText(value: unknown, allowNewlines = false): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const collapsed = allowNewlines
    ? value.replace(/\r\n?/g, '\n').replace(/\u0000/g, '').trim()
    : value.replace(/\s+/g, ' ').replace(/\u0000/g, '').trim()

  return collapsed.length > 0 ? collapsed : undefined
}

function optionalText(maxLength: number, allowNewlines = false) {
  return z.preprocess((value) => sanitizeText(value, allowNewlines), z.string().max(maxLength).optional())
}

const honeypotSchema = z.preprocess((value) => sanitizeText(value), z.string().max(0).optional())

const sharedLeadFields = {
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .transform(normalizeEmail),
  company: optionalText(120),
  role: optionalText(120),
  teamSize: z.coerce.number().int().min(1, 'Team size must be at least 1').max(100000).optional(),
  message: optionalText(2000, true),
  shareId: z.preprocess(
    (value) => sanitizeText(value),
    z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/).optional()
  ),
  reportTitle: optionalText(160),
  reportUrl: z.preprocess((value) => sanitizeText(value), z.string().url().optional()),
  source: z.enum(['landing_page', 'audit_page', 'audit_results', 'share_page', 'contact_widget']),
  honeypot: honeypotSchema,
  startedAt: z.string().datetime().optional()
}

export const leadCaptureSchema = z.object(sharedLeadFields).strip()

export const reportEmailSchema = leadCaptureSchema.extend({
  shareId: z
    .preprocess((value) => sanitizeText(value), z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/))
    .optional(),
  reportTitle: optionalText(160),
  reportUrl: z.preprocess((value) => sanitizeText(value), z.string().url().optional())
})

export const contactRequestSchema = leadCaptureSchema.extend({
  message: z.preprocess((value) => sanitizeText(value, true), z.string().min(10, 'Add a short note so we can help').max(2000))
})

export const leadLookupSchema = z.string().uuid('Lead id must be a UUID')

export type LeadCaptureFormInput = z.infer<typeof leadCaptureSchema>
export type ReportEmailFormInput = z.infer<typeof reportEmailSchema>
export type ContactFormInput = z.infer<typeof contactRequestSchema>

export function getLeadSourceContext(source: LeadSource): string {
  switch (source) {
    case 'audit_results':
      return 'audit_results'
    case 'audit_page':
      return 'audit_page'
    case 'share_page':
      return 'share_page'
    case 'contact_widget':
      return 'contact_widget'
    default:
      return 'landing_page'
  }
}
