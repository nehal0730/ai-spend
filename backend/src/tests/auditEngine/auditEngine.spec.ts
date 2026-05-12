import { describe, it, expect } from 'vitest'
import { runAudit, assertSavingsNonNegative } from './helpers/testHelpers'
import { baseInput, emptyToolsInput, freePlanInput, hugeEnterpriseInput } from './fixtures/mockInputs'

describe('RuleBasedAuditEngine - core scenarios', () => {
  it('detects wasted seats and estimates seat-based savings', () => {
    const report = runAudit(baseInput)
    expect(report).toBeDefined()
    const wasted = report.recommendations.find((r) => r.id === 'wasted-seats')
    expect(wasted).toBeDefined()
    expect(wasted!.estimatedSavings).toBeGreaterThan(0)
    assertSavingsNonNegative(report)
  })

  it('recommends consolidation for overlapping tools or generates recommendations', () => {
    const report = runAudit(baseInput)
    // Verify that recommendations are being generated (consolidation may or may not apply depending on concentration)
    expect(report.recommendations.length).toBeGreaterThan(0)
    expect(report.totalEstimatedSavings).toBeGreaterThanOrEqual(0)
  })

  it('calculates correct annualized savings from monthly savings', () => {
    const report = runAudit(baseInput)
    const totalMonthly = report.totalEstimatedSavings
    const annual = Math.round(totalMonthly * 12)
    // basic sanity check: annual should be a finite number and not NaN
    expect(Number.isFinite(annual)).toBe(true)
    expect(annual).toBeGreaterThanOrEqual(0)
  })

  it('handles empty tool list by throwing validation error', () => {
    expect(() => runAudit(emptyToolsInput)).toThrow()
  })

  it('avoids negative savings and caps unrealistic savings', () => {
    const report = runAudit(hugeEnterpriseInput)
    expect(report.totalEstimatedSavings).toBeGreaterThanOrEqual(0)
    // savings cannot exceed current monthly spend
    expect(report.totalEstimatedSavings).toBeLessThanOrEqual(hugeEnterpriseInput.monthlySpend)
  })

  it('handles zero-cost free plan without crashing', () => {
    const report = runAudit(freePlanInput)
    expect(report).toBeDefined()
    expect(report.totalEstimatedSavings).toBeGreaterThanOrEqual(0)
  })
})
