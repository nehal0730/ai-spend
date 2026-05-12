import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { z } from 'zod'
import { auditEngine } from '../../lib/audit-engine'
import { AuditInput } from '../../lib/audit-engine/types'

// Minimal mock app without full server init
const app = express()
app.use(express.json())

const toolSchema = z.object({
  provider: z.string().min(1),
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

app.post('/audit/analyze', (req, res) => {
  const parsed = auditRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid audit input',
      issues: parsed.error.issues
    })
  }

  const body = parsed.data
  const calculatedSpend = body.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0)
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
  return res.json({ report, share: { shareId: 'mock-123', publicUrl: 'https://example.com/share/mock-123' } })
})

describe('POST /audit/analyze', () => {
  it('returns 200 and a report for valid input', async () => {
    const payload = {
      plan: 'growth',
      monthlySpend: 5000,
      seatCount: 25,
      teamSize: 20,
      primaryUseCase: 'engineering',
      tools: [
        { provider: 'OpenAI', toolName: 'OpenAI API', monthlySpend: 2000, activeSeats: 15 },
        { provider: 'Cursor', toolName: 'Cursor IDE', monthlySpend: 800, activeSeats: 10 }
      ]
    }

    const res = await request(app).post('/audit/analyze').send(payload)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('report')
    expect(res.body.report).toHaveProperty('totalEstimatedSavings')
    expect(res.body.report.totalEstimatedSavings).toBeGreaterThanOrEqual(0)
  })
})
