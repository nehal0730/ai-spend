import { AuditInput, AuditRecommendation, AuditReport, FinancialRule } from './types'
import { ALL_RULES } from './rules'
import { calculateAuditSummary } from './calculations'

export class RuleBasedAuditEngine {
  private rules: FinancialRule[]

  constructor(customRules?: FinancialRule[]) {
    this.rules = customRules ?? ALL_RULES
  }

  public audit(input: AuditInput): AuditReport {
    this.validateInput(input)

    const summary = calculateAuditSummary(input)
    const recommendations: AuditRecommendation[] = []
    let totalSavings = 0
    let rulesApplied = 0
    let highConfidenceCount = 0

    for (const rule of this.rules) {
      const applicability = rule.applicability(input)
      if (!applicability.applies) continue

      const result = rule.calculate(input)
      if (!result.applies) continue

      recommendations.push({
        id: rule.id,
        category: rule.category,
        priority: rule.priority,
        title: rule.name,
        description: rule.description,
        estimatedSavings: result.estimatedSavings,
        implementation: result.implementation,
        reasoning: result.reasoning,
        riskLevel: result.riskLevel,
        timeframe: result.timeframe,
        confidence: rule.confidence
      })

      totalSavings += result.estimatedSavings
      rulesApplied += 1
      if (rule.confidence === 'high') highConfidenceCount += 1
    }

    recommendations.sort((left, right) => (left.priority !== right.priority ? left.priority - right.priority : right.estimatedSavings - left.estimatedSavings))

    // Sanity check: savings cannot exceed 100% of current monthly spend
    const maxSavings = input.monthlySpend * 1.0 // 100% absolute maximum
    const cappedSavings = Math.min(totalSavings, maxSavings)
    
    if (cappedSavings < totalSavings) {
      console.warn(`[Audit Engine] Calculated savings $${totalSavings.toFixed(2)} exceeds 100% of spend. Capping at $${cappedSavings.toFixed(2)}`)
    }

    return {
      timestamp: new Date().toISOString(),
      input,
      summary,
      recommendations,
      totalEstimatedSavings: cappedSavings,
      auditMetadata: {
        rulesEvaluated: this.rules.length,
        rulesApplied,
        highConfidenceRecommendations: highConfidenceCount
      }
    }
  }

  public addRule(rule: FinancialRule): void {
    this.rules.push(rule)
  }

  public getHighPriorityRecommendations(report: AuditReport): AuditRecommendation[] {
    return report.recommendations.filter((recommendation) => recommendation.priority === 1)
  }

  public estimateImplementationSavings(report: AuditReport, recommendationIds: string[]): number {
    return report.recommendations.filter((recommendation) => recommendationIds.includes(recommendation.id)).reduce((sum, recommendation) => sum + recommendation.estimatedSavings, 0)
  }

  private validateInput(input: AuditInput): void {
    if (input.monthlySpend < 0) throw new Error('Monthly spend cannot be negative')
    if (input.monthlySpend > 1000000) throw new Error('Monthly spend seems unrealistically high (>$1M)')
    if (input.seatCount <= 0) throw new Error('Seat count must be greater than 0')
    if (input.teamSize <= 0) throw new Error('Team size must be greater than 0')
    if (input.tools.length === 0) throw new Error('At least one tool must be provided')
    
    // Validate individual tool spends
    for (const tool of input.tools) {
      if (tool.monthlySpend < 0) throw new Error(`Tool spend cannot be negative: ${tool.toolName}`)
      if (tool.monthlySpend > input.monthlySpend * 2) {
        console.warn(`[Audit] Warning: Tool ${tool.toolName} spend ($${tool.monthlySpend}) exceeds total spend by 2x`)
      }
    }
  }
}

export const auditEngine = new RuleBasedAuditEngine()