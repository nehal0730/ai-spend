import { AuditInput } from '../../../lib/audit-engine/types'

export const baseInput: AuditInput = {
  monthlySpend: 5000,
  seatCount: 25,
  teamSize: 20,
  primaryUseCase: 'engineering',
  currentPlan: 'growth',
  tools: [
    { provider: 'OpenAI', toolName: 'OpenAI API', monthlySpend: 1000, activeSeats: 15 },
    { provider: 'Cursor', toolName: 'Cursor IDE', monthlySpend: 800, activeSeats: 10 },
    { provider: 'GitHub Copilot', toolName: 'Copilot', monthlySpend: 800, activeSeats: 20 },
    { provider: 'Windsurf', toolName: 'Windsurf IDE', monthlySpend: 800, activeSeats: 8 },
    { provider: 'Perplexity', toolName: 'Perplexity', monthlySpend: 600, activeSeats: 5 }
  ]
}

export const emptyToolsInput: AuditInput = {
  ...baseInput,
  tools: [],
  monthlySpend: 0
}

export const freePlanInput: AuditInput = {
  monthlySpend: 0,
  seatCount: 10,
  teamSize: 10,
  primaryUseCase: 'marketing',
  currentPlan: 'starter',
  tools: [
    { provider: 'FreeTool', toolName: 'FreeTool', monthlySpend: 0, activeSeats: 5 }
  ]
}

export const hugeEnterpriseInput: AuditInput = {
  monthlySpend: 120000,
  seatCount: 2000,
  teamSize: 1500,
  primaryUseCase: 'enterprise-ops',
  currentPlan: 'enterprise',
  tools: Array.from({ length: 20 }).map((_, i) => ({ provider: `Vendor${i}`, toolName: `Vendor${i}`, monthlySpend: 6000 + i * 100, activeSeats: 100 }))
}
