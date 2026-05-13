import { AuditInput, FinancialRule, RuleResult } from './types'
import { AUDIT_THRESHOLDS, calculateExpectedCost, calculateOverpayment, getPricingConfig } from './pricing'
import { calculateAuditSummary, assessTeamSizeAdequacy, findOverlappingTools } from './calculations'

export const HIGH_COST_PER_TEAM_MEMBER: FinancialRule = {
  id: 'high-cost-per-team',
  name: 'High Cost Per Team Member',
  category: 'governance',
  description: 'Spending more than expected per team member',
  priority: 1,
  confidence: 'high',
  applicability: (input) => {
    const costPerMember = input.monthlySpend / input.teamSize
    return { applies: costPerMember > AUDIT_THRESHOLDS.highCostPerTeamMember, reason: `Cost per team member: $${costPerMember.toFixed(2)}` }
  },
  calculate: (input): RuleResult => {
    const costPerMember = input.monthlySpend / input.teamSize
    const excess = costPerMember - AUDIT_THRESHOLDS.highCostPerTeamMember
    const savings = excess * input.teamSize
    return {
      applies: costPerMember > AUDIT_THRESHOLDS.highCostPerTeamMember,
      recommendation: `Reduce per-person spend from $${costPerMember.toFixed(2)} to $${AUDIT_THRESHOLDS.highCostPerTeamMember}`,
      estimatedSavings: savings,
      implementation: 'Review tool portfolio, consolidate overlapping tools, renegotiate contracts',
      reasoning: `CALCULATION:\n- Current spend: $${input.monthlySpend}/month\n- Team size: ${input.teamSize} people\n- Per-person cost: $${costPerMember.toFixed(2)}/month\n- Industry benchmark: $${AUDIT_THRESHOLDS.highCostPerTeamMember}/month\n- Excess: $${excess.toFixed(2)}/person = $${savings.toFixed(2)}/month total`,
      riskLevel: 'low',
      timeframe: 'long-term'
    }
  }
}

export const WASTED_SEATS: FinancialRule = {
  id: 'wasted-seats',
  name: 'Wasted Seat Capacity',
  category: 'seat-optimization',
  description: 'Paying for seats that are not being actively used',
  priority: 1,
  confidence: 'high',
  applicability: (input) => {
    const avgActivePerTool = input.tools.reduce((sum, tool) => sum + tool.activeSeats, 0) / Math.max(1, input.tools.length)
    const wastage = (input.seatCount - avgActivePerTool) / input.seatCount
    return { applies: wastage > 0.2, reason: `${Math.round(wastage * 100)}% of seats appear unused` }
  },
  calculate: (input): RuleResult => {
    const totalActiveSeats = input.tools.reduce((sum, tool) => sum + tool.activeSeats, 0)
    const avgActiveSeat = totalActiveSeats / Math.max(1, input.tools.length)
    const wastedSeats = input.seatCount - avgActiveSeat
    const savings = (wastedSeats / input.seatCount) * input.monthlySpend
    return {
      applies: wastedSeats > 0,
      recommendation: `Reduce seat count from ${input.seatCount} to ~${Math.ceil(avgActiveSeat)}`,
      estimatedSavings: savings,
      implementation: 'Audit active tool usage, remove inactive seats, consider pay-per-use models',
      reasoning: `CALCULATION:\n- Total seats purchased: ${input.seatCount}\n- Average active seats per tool: ${avgActiveSeat.toFixed(1)}\n- Wasted seats: ${wastedSeats.toFixed(1)}\n- Monthly spend: $${input.monthlySpend}\n- Potential savings: $${savings.toFixed(2)}/month`,
      riskLevel: 'low',
      timeframe: 'immediate'
    }
  }
}

export const TOOL_CONSOLIDATION: FinancialRule = {
  id: 'tool-consolidation',
  name: 'Tool Consolidation Opportunity',
  category: 'consolidation',
  description: 'Multiple tools in the same category that could be consolidated',
  priority: 2,
  confidence: 'medium',
  applicability: (input) => {
    const overlaps = findOverlappingTools(input.tools)
    const summary = calculateAuditSummary(input)
    return { applies: overlaps.length > 0 && input.tools.length >= AUDIT_THRESHOLDS.minToolsForConsolidation && summary.spendDistribution.concentration === 'low', reason: `Found ${overlaps.length} overlapping tools and spend is distributed` }
  },
  calculate: (input): RuleResult => {
    const overlaps = findOverlappingTools(input.tools)
    const savings = overlaps.reduce((sum, overlap) => sum + Math.min(overlap.tool1.monthlySpend, overlap.tool2.monthlySpend) * 0.3, 0)
    return {
      applies: overlaps.length > 0,
      recommendation: `Consolidate ${overlaps.length} duplicate tools`,
      estimatedSavings: savings,
      implementation: '- Audit which overlapping tools provide the most value\n- Migrate users from redundant tool to primary tool\n- Cancel subscriptions for eliminated tools\n- Consider negotiating volume discount with consolidated provider',
      reasoning: `CALCULATION:\n- Overlapping tools found: ${overlaps.length}\n- Conservative consolidation estimate: $${savings.toFixed(2)}/month`,
      riskLevel: 'medium',
      timeframe: 'long-term'
    }
  }
}

export const HIGH_TOOL_CONCENTRATION: FinancialRule = {
  id: 'high-concentration',
  name: 'Single Tool Dependency',
  category: 'governance',
  description: 'One tool represents too large a percentage of spend',
  priority: 1,
  confidence: 'high',
  applicability: (input) => {
    const summary = calculateAuditSummary(input)
    return { applies: summary.topExpensiveTool.percentage / 100 > AUDIT_THRESHOLDS.highToolConcentration, reason: `Top tool is ${summary.topExpensiveTool.percentage.toFixed(1)}% of spend` }
  },
  calculate: (input): RuleResult => {
    const summary = calculateAuditSummary(input)
    const topToolPercentage = summary.topExpensiveTool.percentage / 100
    const savings = Math.max(0, (topToolPercentage - AUDIT_THRESHOLDS.highToolConcentration) * input.monthlySpend)
    return {
      applies: topToolPercentage > AUDIT_THRESHOLDS.highToolConcentration,
      recommendation: `Reduce dependency on ${summary.topExpensiveTool.name} (currently ${summary.topExpensiveTool.percentage.toFixed(1)}% of spend)`,
      estimatedSavings: savings,
      implementation: '- Evaluate alternative tools for the same use case\n- Implement tool rotation policies to reduce vendor lock-in\n- Negotiate volume discounts with top tool provider\n- Train team on cost-conscious tool usage',
      reasoning: `CALCULATION:\n- Top tool: ${summary.topExpensiveTool.name}\n- Current spend: $${summary.topExpensiveTool.spend}/month\n- Percentage of total: ${summary.topExpensiveTool.percentage.toFixed(1)}%`,
      riskLevel: 'low',
      timeframe: 'long-term'
    }
  }
}

export const PLAN_OPTIMIZATION: FinancialRule = {
  id: 'plan-optimization',
  name: 'Plan Tier Optimization',
  category: 'plan-optimization',
  description: 'Current plan tier may not be optimal for seat count',
  priority: 2,
  confidence: 'medium',
  applicability: (input) => ({ applies: input.tools.length > 0, reason: 'Always evaluate plan optimization' }),
  calculate: (input): RuleResult => {
    let bestSavings = 0
    let recommendation = ''

    for (const tool of input.tools) {
      const pricing = getPricingConfig(tool.provider)
      if (!pricing) continue

      // Prefer per-tool active seats when available, fallback to org seatCount
      const seatsForTool = Math.max(1, tool.activeSeats || input.seatCount)
      const expectedCost = calculateExpectedCost(pricing, seatsForTool)
      const overpay = calculateOverpayment(tool.monthlySpend, expectedCost)

      if (overpay.percentage > 20) {
        const reportedPlan = tool.plan ? ` reported plan: ${tool.plan}` : ''
        recommendation = `${tool.toolName}${reportedPlan}: negotiate to ~$${expectedCost.toFixed(2)}/month for ${seatsForTool} seat(s) (currently $${tool.monthlySpend})`
        bestSavings += overpay.amount
      }
    }

    return {
      applies: bestSavings > 0,
      recommendation: recommendation || 'Current plans appear well-optimized',
      estimatedSavings: bestSavings,
      implementation: 'Contact vendors with pricing comparison data, request volume discounts',
      reasoning: `CALCULATION:\nExpected costs based on standard market pricing with applicable bulk discounts.\n${recommendation ? `Overpayment detected: $${bestSavings.toFixed(2)}/month` : 'No significant overpayment detected'}`,
      riskLevel: 'low',
      timeframe: 'immediate'
    }
  }
}

export const TEAM_SIZE_MISMATCH: FinancialRule = {
  id: 'team-size-mismatch',
  name: 'Team Size & Seat Count Mismatch',
  category: 'seat-optimization',
  description: 'Seat count does not align with actual team size',
  priority: 2,
  confidence: 'medium',
  applicability: (input) => ({ applies: assessTeamSizeAdequacy(input.teamSize, input.seatCount).assessment === 'overbought', reason: assessTeamSizeAdequacy(input.teamSize, input.seatCount).explanation }),
  calculate: (input): RuleResult => {
    const assessment = assessTeamSizeAdequacy(input.teamSize, input.seatCount)
    const unnecessarySeats = Math.max(0, input.seatCount - input.teamSize)
    const savings = (unnecessarySeats / input.seatCount) * input.monthlySpend
    return {
      applies: assessment.assessment === 'overbought',
      recommendation: `Reduce seats from ${input.seatCount} to match team size of ${input.teamSize}`,
      estimatedSavings: savings,
      implementation: 'Audit actual team structure, remove seats assigned to inactive team members',
      reasoning: `CALCULATION:\n- Team size: ${input.teamSize} people\n- Seats purchased: ${input.seatCount}\n- Ratio: ${assessment.ratio.toFixed(2)}x (should be ~1.0-1.2x)\n- Unnecessary seats: ${unnecessarySeats}`,
      riskLevel: 'medium',
      timeframe: 'short-term'
    }
  }
}

export const ALL_RULES: FinancialRule[] = [HIGH_COST_PER_TEAM_MEMBER, WASTED_SEATS, TOOL_CONSOLIDATION, HIGH_TOOL_CONCENTRATION, PLAN_OPTIMIZATION, TEAM_SIZE_MISMATCH]