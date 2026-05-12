import { AuditReport, AuditInput } from '../../../lib/audit-engine/types'
import { auditEngine } from '../../../lib/audit-engine'

export function assertSavingsNonNegative(report: AuditReport) {
  if (report.totalEstimatedSavings < 0) throw new Error('Total estimated savings is negative')
}

export function runAudit(input: AuditInput) {
  return auditEngine.audit(input)
}
