import rateLimit from 'express-rate-limit'
import { getOptionalNumberEnv } from '../lib/env'

function buildLeadKey(req: any): string {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  return email ? `${req.ip}:${email}` : req.ip
}

const leadWindowMs = getOptionalNumberEnv('LEAD_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)
const leadSubmissionMax = getOptionalNumberEnv('LEAD_RATE_LIMIT_MAX', 10)
const contactSubmissionMax = getOptionalNumberEnv('CONTACT_RATE_LIMIT_MAX', 5)

export const leadSubmissionRateLimit = rateLimit({
  windowMs: leadWindowMs,
  max: leadSubmissionMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: buildLeadKey,
  message: {
    error: 'Too many lead submissions. Please wait a few minutes and try again.'
  }
})

export const reportEmailRateLimit = rateLimit({
  windowMs: leadWindowMs,
  max: Math.max(leadSubmissionMax, 5),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: buildLeadKey,
  message: {
    error: 'Too many report requests. Please wait a few minutes and try again.'
  }
})

export const contactRateLimit = rateLimit({
  windowMs: leadWindowMs,
  max: contactSubmissionMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: buildLeadKey,
  message: {
    error: 'Too many contact requests. Please try again later.'
  }
})
