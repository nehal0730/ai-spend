import { z } from 'zod'

export const aiToolProviders = [
  'OpenAI',
  'Anthropic',
  'Google AI',
  'Azure OpenAI',
  'Cohere',
  'Replicate',
  'Custom'
] as const

export const planOptions = [
  {
    value: 'starter',
    label: 'Starter',
    description: 'Best for teams validating AI spend and looking for a fast first audit.'
  },
  {
    value: 'growth',
    label: 'Growth',
    description: 'For teams with multiple tools, shared budgets, and recurring reviews.'
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'For larger orgs with governance, multiple workspaces, and security reviews.'
  }
] as const

export const primaryUseCaseOptions = [
  {
    value: 'cost-visibility',
    label: 'Cost visibility'
  },
  {
    value: 'budget-control',
    label: 'Budget control'
  },
  {
    value: 'team-consolidation',
    label: 'Team consolidation'
  },
  {
    value: 'vendor-comparison',
    label: 'Vendor comparison'
  },
  {
    value: 'usage-optimization',
    label: 'Usage optimization'
  }
] as const

export type PlanOptionValue = (typeof planOptions)[number]['value']
export type PrimaryUseCaseValue = (typeof primaryUseCaseOptions)[number]['value']
export type AiToolProvider = (typeof aiToolProviders)[number]

export type ToolRow = {
  id: string
  provider: AiToolProvider
  toolName: string
  monthlySpend: number
  activeSeats: number
}

export type AISpendFormValues = {
  plan: PlanOptionValue
  monthlySpend: number
  seatCount: number
  teamSize: number
  primaryUseCase: PrimaryUseCaseValue
  tools: ToolRow[]
}

const toolRowSchema = z.object({
  id: z.string().min(1),
  provider: z.enum(aiToolProviders),
  toolName: z.string().min(2, 'Tool name is required'),
  monthlySpend: z.coerce.number().min(0, 'Monthly spend must be 0 or greater'),
  activeSeats: z.coerce.number().int().min(1, 'Active seats must be at least 1')
})

export const aiSpendFormSchema = z.object({
  plan: z.enum(['starter', 'growth', 'enterprise']),
  monthlySpend: z.coerce.number().min(0, 'Monthly spend must be 0 or greater'),
  seatCount: z.coerce.number().int().min(1, 'Seat count must be at least 1'),
  teamSize: z.coerce.number().int().min(1, 'Team size must be at least 1'),
  primaryUseCase: z.enum(['cost-visibility', 'budget-control', 'team-consolidation', 'vendor-comparison', 'usage-optimization']),
  tools: z.array(toolRowSchema).min(1, 'Add at least one AI tool')
})

export const defaultToolRow = (provider: AiToolProvider = 'OpenAI'): ToolRow => ({
  id: globalThis.crypto?.randomUUID?.() ?? `tool-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  provider,
  toolName: provider,
  monthlySpend: 0,
  activeSeats: 1
})

export const defaultAISpendFormValues: AISpendFormValues = {
  plan: 'growth',
  monthlySpend: 2500,
  seatCount: 12,
  teamSize: 18,
  primaryUseCase: 'cost-visibility',
  tools: [defaultToolRow('OpenAI'), defaultToolRow('Anthropic')]
}

export function createToolRow(provider: AiToolProvider = 'OpenAI') {
  return defaultToolRow(provider)
}