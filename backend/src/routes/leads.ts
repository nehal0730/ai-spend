import { createHash, randomUUID } from 'crypto'
import { Router } from 'express'
import { validateBody } from '../middleware/validate'
import { requireAdminToken } from '../middleware/adminAuth'
import { contactRateLimit, leadSubmissionRateLimit, reportEmailRateLimit } from '../middleware/submissionRateLimit'
import {
  contactRequestSchema,
  leadCaptureSchema,
  leadLookupSchema,
  reportEmailSchema
} from '../lib/lead-capture/validation'
import {
  getLeadAdminSummary,
  requestAuditReport,
  requestContactFollowUp,
  submitLeadCapture
} from '../lib/lead-capture/service'

const router = Router()

function buildRequestContext(req: any) {
  const ipAddress = req.ip || null
  const ipHash = ipAddress ? createHash('sha256').update(String(ipAddress)).digest('hex') : null

  return {
    requestId: req.header('x-request-id') || req.id || randomUUID(),
    ipAddress,
    ipHash,
    userAgent: req.header('user-agent') || null,
    referer: req.header('referer') || null,
    origin: req.header('origin') || null
  }
}

router.post('/leads', validateBody(leadCaptureSchema), leadSubmissionRateLimit, async (req, res) => {
  const result = await submitLeadCapture(req.body, buildRequestContext(req))
  return res.status(result.status === 'deduped' ? 200 : 201).json({ success: true, data: result })
})

router.post('/reports/email', validateBody(reportEmailSchema), reportEmailRateLimit, async (req, res) => {
  const result = await requestAuditReport(req.body, buildRequestContext(req))
  return res.status(result.status === 'deduped' ? 200 : 201).json({ success: true, data: result })
})

router.post('/contact', validateBody(contactRequestSchema), contactRateLimit, async (req, res) => {
  const result = await requestContactFollowUp(req.body, buildRequestContext(req))
  return res.status(result.status === 'deduped' ? 200 : 201).json({ success: true, data: result })
})

router.get('/leads/:id', requireAdminToken, async (req, res) => {
  const parsed = leadLookupSchema.safeParse(req.params.id)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid lead id' })
  }

  const summary = await getLeadAdminSummary(parsed.data)
  if (!summary) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  return res.json({ success: true, data: summary })
})

export { router as leadRouter }
