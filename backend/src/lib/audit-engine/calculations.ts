import { AuditInput, AuditSummary, AuditTool } from './types'

export function categorizeToolProvider(provider: string): string {
  const normalized = provider.toLowerCase()
  const categories: Record<string, string[]> = {
    LLM: ['openai', 'claude', 'gemini', 'gpt', 'chatgpt', 'anthropic'],
    'IDE/Editor': ['cursor', 'windsurf', 'github copilot', 'copilot', 'vscode'],
    Specialized: ['perplexity', 'hugging face', 'replicate'],
    Other: []
  }

  for (const [category, providers] of Object.entries(categories)) {
    if (category === 'Other') continue
    if (providers.some((value) => normalized.includes(value))) return category
  }

  return 'Other'
}

export function calculateConcentration(tools: AuditTool[], totalSpend: number): 'high' | 'medium' | 'low' {
  if (tools.length === 0 || totalSpend === 0) return 'low'

  const herfindahl = tools.reduce((sum, tool) => {
    const share = tool.monthlySpend / totalSpend
    return sum + share * share
  }, 0)

  if (herfindahl > 0.25) return 'high'
  if (herfindahl > 0.15) return 'medium'
  return 'low'
}

export function calculateAuditSummary(input: AuditInput): AuditSummary {
  const totalSpend = input.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0)
  const toolCount = input.tools.length
  const avgCostPerTool = toolCount > 0 ? totalSpend / toolCount : 0
  const costPerTeamMember = input.teamSize > 0 ? totalSpend / input.teamSize : 0
  const costPerActiveUser = input.seatCount > 0 ? totalSpend / input.seatCount : 0

  let topExpensiveTool = { name: 'N/A', spend: 0, percentage: 0 }
  if (toolCount > 0) {
    const max = input.tools.reduce((prev, current) => (current.monthlySpend > prev.monthlySpend ? current : prev))
    topExpensiveTool = {
      name: max.toolName || max.provider,
      spend: max.monthlySpend,
      percentage: totalSpend > 0 ? (max.monthlySpend / totalSpend) * 100 : 0
    }
  }

  const byCategory: Record<string, number> = {}
  for (const tool of input.tools) {
    const category = categorizeToolProvider(tool.provider)
    byCategory[category] = (byCategory[category] || 0) + tool.monthlySpend
  }

  return {
    currentSpend: totalSpend,
    toolCount,
    avgCostPerTool,
    costPerTeamMember,
    costPerActiveUser,
    topExpensiveTool,
    spendDistribution: {
      byCategory,
      concentration: calculateConcentration(input.tools, totalSpend)
    }
  }
}

export function findOverlappingTools(tools: AuditTool[]): Array<{ tool1: AuditTool; tool2: AuditTool; reason: string }> {
  const overlaps: Array<{ tool1: AuditTool; tool2: AuditTool; reason: string }> = []
  const grouped: Record<string, AuditTool[]> = {}

  for (const tool of tools) {
    const category = categorizeToolProvider(tool.provider)
    grouped[category] = grouped[category] ?? []
    grouped[category].push(tool)
  }

  for (const [category, categoryTools] of Object.entries(grouped)) {
    if (category !== 'Other' && categoryTools.length > 2) {
      for (let index = 0; index < categoryTools.length - 1; index++) {
        overlaps.push({ tool1: categoryTools[index], tool2: categoryTools[index + 1], reason: `Both are ${category} tools` })
      }
    }
  }

  return overlaps
}

export function assessTeamSizeAdequacy(teamSize: number, seatCount: number): { ratio: number; assessment: 'underbought' | 'adequate' | 'overbought'; explanation: string } {
  const ratio = seatCount / teamSize

  if (ratio < 0.5) return { ratio, assessment: 'underbought', explanation: 'Fewer seats than team members - some tools may be underutilized' }
  if (ratio <= 1.5) return { ratio, assessment: 'adequate', explanation: 'Seat count aligns well with team size' }
  return { ratio, assessment: 'overbought', explanation: 'More seats than team members - potential waste' }
}

export function findAnomalousToolCosts(tools: AuditTool[]): AuditTool[] {
  if (tools.length < 3) return []

  const costs = tools.map((tool) => tool.monthlySpend)
  const mean = costs.reduce((sum, value) => sum + value, 0) / costs.length
  const variance = costs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / costs.length
  const stdDev = Math.sqrt(variance)
  if (stdDev === 0) return []

  return tools.filter((tool) => Math.abs((tool.monthlySpend - mean) / stdDev) > 2.5)
}

export function calculateSwitchingROI(currentCost: number, newToolCost: number, switchingCost: number, months = 12): { monthlyNetSavings: number; breakevenMonths: number; totalSavings: number; roiPercentage: number } {
  const monthlyNetSavings = currentCost - newToolCost
  const breakevenMonths = monthlyNetSavings > 0 ? switchingCost / monthlyNetSavings : Number.POSITIVE_INFINITY
  const totalSavings = monthlyNetSavings * months - switchingCost
  const roiPercentage = switchingCost > 0 ? (totalSavings / switchingCost) * 100 : 0

  return { monthlyNetSavings, breakevenMonths, totalSavings, roiPercentage }
}