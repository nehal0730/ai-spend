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

export interface AuditShareLink {
  shareId: string
  publicUrl: string
  frontendUrl?: string
}

export interface AnalyzeAuditResponse {
  report: AuditReport
  share: AuditShareLink
}

export interface PublicRecommendation {
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

export interface PublicAuditSharePayload {
  shareId: string
  generatedAt: string
  title: string
  optimizationSummary: string
  description: string
  monthlySpend: number
  annualSpend: number
  totalEstimatedSavings: number
  annualEstimatedSavings: number
  toolCount: number
  recommendationsCount: number
  highImpactRecommendationCount: number
  topTool: {
    name: string
    spend: number
    percentage: number
  }
  summary: AuditSummary
  recommendations: PublicRecommendation[]
}

export interface SharedAuditApiResponse {
  shareId: string
  title: string
  description: string
  publishedAt: string
  payload: PublicAuditSharePayload
}