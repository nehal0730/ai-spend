import { AuditReport } from '../audit-engine/types'
import { PublicAuditSharePayload, PublicRecommendation } from './types'

function currency(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function buildOptimizationSummary(report: AuditReport): string {
  const highPriority = report.recommendations.filter((item) => item.priority <= 2).length
  const annualSavings = report.totalEstimatedSavings * 12

  return `AI Spend Audit identified ${report.recommendations.length} actions, including ${highPriority} high-priority opportunities, with up to $${currency(annualSavings)}/year in potential savings.`
}

function toPublicRecommendation(item: AuditReport['recommendations'][number]): PublicRecommendation {
  return {
    category: item.category,
    priority: item.priority,
    title: item.title,
    description: item.description,
    estimatedSavings: item.estimatedSavings,
    implementation: item.implementation,
    reasoning: item.reasoning,
    riskLevel: item.riskLevel,
    timeframe: item.timeframe,
    confidence: item.confidence
  }
}

export function toPublicAuditSharePayload(shareId: string, report: AuditReport): PublicAuditSharePayload {
  const annualEstimatedSavings = report.totalEstimatedSavings * 12
  const annualSpend = report.summary.currentSpend * 12
  const topTool = report.summary.topExpensiveTool

  const savingsHeadline = `Save $${currency(annualEstimatedSavings)}/year on your AI stack`
  const optimizationSummary = buildOptimizationSummary(report)

  return {
    shareId,
    generatedAt: report.timestamp,
    title: savingsHeadline,
    optimizationSummary,
    description: `AI Spend Audit found optimization opportunities across ${report.summary.toolCount} tools with projected annual savings up to $${currency(annualEstimatedSavings)}.`,
    monthlySpend: report.summary.currentSpend,
    annualSpend,
    totalEstimatedSavings: report.totalEstimatedSavings,
    annualEstimatedSavings,
    toolCount: report.summary.toolCount,
    recommendationsCount: report.recommendations.length,
    highImpactRecommendationCount: report.recommendations.filter((item) => item.priority <= 2).length,
    topTool: {
      name: topTool.name,
      spend: topTool.spend,
      percentage: topTool.percentage
    },
    summary: report.summary,
    recommendations: report.recommendations.map(toPublicRecommendation)
  }
}
