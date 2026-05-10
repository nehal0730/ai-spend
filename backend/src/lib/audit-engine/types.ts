export type PlanType = 'starter' | 'growth' | 'enterprise'

export type RecommendationCategory =
  | 'consolidation'
  | 'negotiation'
  | 'usage-optimization'
  | 'plan-optimization'
  | 'governance'
  | 'seat-optimization'

export interface AuditTool {
  provider: string
  toolName: string
  monthlySpend: number
  activeSeats: number
}

export interface AuditInput {
  monthlySpend: number
  seatCount: number
  teamSize: number
  primaryUseCase: string
  currentPlan: PlanType
  tools: AuditTool[]
}

export interface FinancialRule {
  id: string
  name: string
  category: RecommendationCategory
  description: string
  applicability: (input: AuditInput) => { applies: boolean; reason?: string }
  calculate: (input: AuditInput) => RuleResult
  priority: number
  confidence: 'high' | 'medium' | 'low'
}

export interface RuleResult {
  applies: boolean
  recommendation: string
  estimatedSavings: number
  implementation: string
  reasoning: string
  riskLevel: 'low' | 'medium' | 'high'
  timeframe: 'immediate' | 'short-term' | 'long-term'
}

export interface AuditRecommendation {
  id: string
  category: RecommendationCategory
  priority: number
  title: string
  description: string
  estimatedSavings: number
  implementation: string
  reasoning: string
  riskLevel: 'low' | 'medium' | 'high'
  timeframe: 'immediate' | 'short-term' | 'long-term'
  confidence: 'high' | 'medium' | 'low'
}

export interface AuditSummary {
  currentSpend: number
  toolCount: number
  avgCostPerTool: number
  costPerTeamMember: number
  costPerActiveUser: number
  topExpensiveTool: {
    name: string
    spend: number
    percentage: number
  }
  spendDistribution: {
    byCategory: Record<string, number>
    concentration: 'high' | 'medium' | 'low'
  }
}

export interface AuditReport {
  timestamp: string
  input: AuditInput
  summary: AuditSummary
  recommendations: AuditRecommendation[]
  totalEstimatedSavings: number
  auditMetadata: {
    rulesEvaluated: number
    rulesApplied: number
    highConfidenceRecommendations: number
  }
}

export interface PricingTier {
  name: PlanType
  monthlyPerSeat: number
  annualDiscount: number
  minimumSeats: number
  features: string[]
}

export interface ToolPricing {
  provider: string
  baseTier: PricingTier
  premiumTier?: PricingTier
  bulkDiscounts: Array<{ threshold: number; discount: number }>
  negotiationRange: {
    min: number
    max: number
  }
}

export interface AuditThresholds {
  highCostPerTeamMember: number
  highCostPerActiveUser: number
  highToolConcentration: number
  minToolsForConsolidation: number
  maxRecommendedToolCount: number
  spendVarianceThreshold: number
}