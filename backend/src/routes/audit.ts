import { Router } from 'express'
import { z } from 'zod'
import { auditEngine } from '../lib/audit-engine'
import { AuditInput } from '../lib/audit-engine/types'
import { generateAiSummary } from '../lib/ai/gemini'
import { createPublicAuditShare } from '../lib/share/service'

const toolSchema = z.object({
  provider: z.string().min(1),
  plan: z.string().optional(),
  toolName: z.string().min(1),
  monthlySpend: z.number().min(0),
  activeSeats: z.number().int().min(1)
})

const auditRequestSchema = z.object({
  plan: z.enum(['starter', 'growth', 'enterprise']),
  monthlySpend: z.number().min(0),
  seatCount: z.number().int().min(1),
  teamSize: z.number().int().min(1),
  primaryUseCase: z.string().min(1),
  tools: z.array(toolSchema).min(1)
})

const router = Router()

router.post('/analyze', async (req, res) => {
  const parsed = auditRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid audit input',
      issues: parsed.error.issues
    })
  }

  const body = parsed.data
  
  // Calculate actual monthly spend from tools (more reliable than form field)
  const calculatedSpend = body.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0)
  
  // Use calculated spend if form field differs significantly (account for rounding)
  const monthlySpend = Math.abs(body.monthlySpend - calculatedSpend) > 1 ? calculatedSpend : body.monthlySpend
  
  const input: AuditInput = {
    monthlySpend: monthlySpend,
    seatCount: body.seatCount,
    teamSize: body.teamSize,
    primaryUseCase: body.primaryUseCase,
    currentPlan: body.plan,
    tools: body.tools
  }

  const report = auditEngine.audit(input)
  try {
    const share = await createPublicAuditShare(report)
    return res.json({ report, share })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Could not publish share report'
    })
  }
})

export { router as auditRouter }

// AI summary endpoint
router.post('/summary', async (req, res) => {
  // Accept either a full report or the audit input + engine-run report
  const report = req.body
  if (!report) {
    return res.status(400).json({ error: 'Missing report payload' })
  }

  try {
    const result = await generateAiSummary(report)
    return res.json(result)
  } catch (err: any) {
    console.error('AI summary error', err)
    return res.status(500).json({ error: 'Failed to generate summary' })
  }
})