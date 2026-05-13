import { AuditReport, AuditRecommendation } from '../audit-engine/types'

export interface PublicRecommendation {
  category: AuditRecommendation['category']
  priority: number
  title: string
  description: string
  estimatedSavings: number
  implementation: string
  reasoning: string
  riskLevel: AuditRecommendation['riskLevel']
  timeframe: AuditRecommendation['timeframe']
  confidence: AuditRecommendation['confidence']
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
  tools: Array<{ provider: string; toolName: string; monthlySpend: number; activeSeats: number; plan?: string }>
  summary: AuditReport['summary']
  recommendations: PublicRecommendation[]
}

export interface ShareMetadata {
  title: string
  description: string
  imageUrl: string
  canonicalUrl: string
  twitterCard: 'summary_large_image'
}

export interface PublicShareRecord {
  shareId: string
  title: string
  description: string
  ogImageUrl: string
  reportPayload: PublicAuditSharePayload
  publishedAt: string
  expiresAt: string | null
}

export interface AnalyzeAuditResponse {
  report: AuditReport
  share: {
    shareId: string
    publicUrl: string
  }
}
