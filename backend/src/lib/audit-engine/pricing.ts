import { AuditThresholds, PlanType, PricingTier, ToolPricing } from './types'

export const PRICING_TIERS: Record<PlanType, PricingTier> = {
  starter: { name: 'starter', monthlyPerSeat: 20, annualDiscount: 15, minimumSeats: 1, features: ['Basic access', 'Community support'] },
  growth: { name: 'growth', monthlyPerSeat: 40, annualDiscount: 20, minimumSeats: 5, features: ['Priority support', 'Advanced analytics', 'Team management'] },
  enterprise: { name: 'enterprise', monthlyPerSeat: 60, annualDiscount: 25, minimumSeats: 20, features: ['Dedicated support', 'Custom features', 'SSO/SAML', 'Advanced security'] }
}

export const TOOL_PRICING_CONFIGS: Record<string, ToolPricing> = {
  openai: {
    provider: 'OpenAI',
    baseTier: { name: 'growth', monthlyPerSeat: 30, annualDiscount: 15, minimumSeats: 1, features: ['GPT-4 access', 'Code interpreter'] },
    premiumTier: { name: 'enterprise', monthlyPerSeat: 50, annualDiscount: 20, minimumSeats: 10, features: ['Priority API', 'Custom model', 'Dedicated support'] },
    bulkDiscounts: [{ threshold: 10, discount: 10 }, { threshold: 50, discount: 15 }, { threshold: 100, discount: 20 }],
    negotiationRange: { min: -30, max: 10 }
  },
  claude: {
    provider: 'Anthropic (Claude)',
    baseTier: { name: 'growth', monthlyPerSeat: 25, annualDiscount: 10, minimumSeats: 1, features: ['Claude 3 access'] },
    bulkDiscounts: [{ threshold: 20, discount: 12 }, { threshold: 75, discount: 18 }],
    negotiationRange: { min: -25, max: 5 }
  },
  cursor: {
    provider: 'Cursor',
    baseTier: { name: 'starter', monthlyPerSeat: 20, annualDiscount: 10, minimumSeats: 1, features: ['AI-powered code editor'] },
    bulkDiscounts: [{ threshold: 25, discount: 15 }, { threshold: 50, discount: 20 }],
    negotiationRange: { min: -20, max: 0 }
  },
  github_copilot: {
    provider: 'GitHub Copilot',
    baseTier: { name: 'growth', monthlyPerSeat: 10, annualDiscount: 0, minimumSeats: 1, features: ['Code completion', 'ChatGPT integration'] },
    bulkDiscounts: [{ threshold: 50, discount: 10 }, { threshold: 200, discount: 15 }],
    negotiationRange: { min: 0, max: 5 }
  },
  windsurf: {
    provider: 'Windsurf',
    baseTier: { name: 'starter', monthlyPerSeat: 15, annualDiscount: 5, minimumSeats: 1, features: ['Agent-based IDE'] },
    bulkDiscounts: [{ threshold: 30, discount: 10 }],
    negotiationRange: { min: -15, max: 0 }
  },
  gemini: {
    provider: 'Google Gemini',
    baseTier: { name: 'starter', monthlyPerSeat: 20, annualDiscount: 10, minimumSeats: 1, features: ['Gemini Pro access'] },
    bulkDiscounts: [{ threshold: 100, discount: 15 }],
    negotiationRange: { min: -20, max: 5 }
  }
}

export const AUDIT_THRESHOLDS: AuditThresholds = {
  highCostPerTeamMember: 150,
  highCostPerActiveUser: 200,
  highToolConcentration: 0.7,
  minToolsForConsolidation: 5,
  maxRecommendedToolCount: 7,
  spendVarianceThreshold: 3.0
}

export function getPricingConfig(toolName: string): ToolPricing | null {
  const normalized = toolName.toLowerCase()

  if (TOOL_PRICING_CONFIGS[normalized]) return TOOL_PRICING_CONFIGS[normalized]

  const fuzzyMatches: Record<string, string> = {
    gpt: 'openai',
    chatgpt: 'openai',
    copilot: 'github_copilot',
    anthropic: 'claude',
    'gemini pro': 'gemini'
  }

  for (const [key, provider] of Object.entries(fuzzyMatches)) {
    if (normalized.includes(key)) return TOOL_PRICING_CONFIGS[provider] || null
  }

  return null
}

export function calculateExpectedCost(basePricing: ToolPricing, seatCount: number, annualize = false): number {
  let monthlyPerSeat = basePricing.baseTier.monthlyPerSeat
  for (const discount of basePricing.bulkDiscounts) {
    if (seatCount >= discount.threshold) {
      monthlyPerSeat *= 1 - discount.discount / 100
    }
  }

  const monthlyTotal = monthlyPerSeat * seatCount
  if (annualize) {
    return monthlyTotal * 12 * (1 - basePricing.baseTier.annualDiscount / 100)
  }

  return monthlyTotal
}

export function calculateOverpayment(actualSpend: number, expectedSpend: number): { amount: number; percentage: number } {
  const overpayment = actualSpend - expectedSpend
  return { amount: Math.max(0, overpayment), percentage: expectedSpend > 0 ? (Math.max(0, overpayment) / expectedSpend) * 100 : 0 }
}