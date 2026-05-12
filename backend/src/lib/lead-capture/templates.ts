import type { LeadRecord, ReportRequestRecord } from './types'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function renderLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; background: #0f172a; color: #e2e8f0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .wrapper { width: 100%; padding: 32px 16px; background: linear-gradient(180deg, #020617 0%, #0f172a 100%); }
      .card { max-width: 640px; margin: 0 auto; background: rgba(15, 23, 42, 0.94); border: 1px solid rgba(148, 163, 184, 0.18); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 80px rgba(2, 6, 23, 0.35); }
      .hero { padding: 32px 32px 24px; background: linear-gradient(135deg, rgba(6,182,212,0.18), rgba(99,102,241,0.12)); border-bottom: 1px solid rgba(148, 163, 184, 0.12); }
      .eyebrow { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #67e8f9; margin-bottom: 14px; }
      h1 { margin: 0; font-size: 28px; line-height: 1.15; color: #f8fafc; }
      .content { padding: 32px; color: #cbd5e1; font-size: 15px; line-height: 1.7; }
      .cta { display: inline-block; background: linear-gradient(90deg, #06b6d4, #6366f1); color: white; text-decoration: none; padding: 14px 20px; border-radius: 14px; font-weight: 700; margin-top: 12px; }
      .list { margin: 20px 0 0; padding-left: 18px; }
      .muted { color: #94a3b8; font-size: 13px; }
      .footer { padding: 0 32px 30px; color: #94a3b8; font-size: 12px; line-height: 1.6; }
      @media (prefers-color-scheme: light) {
        body { background: #f8fafc; color: #0f172a; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="hero">
          <div class="eyebrow">AI Spend Audit</div>
          <h1>${escapeHtml(title)}</h1>
        </div>
        <div class="content">${bodyHtml}</div>
      </div>
    </div>
  </body>
</html>`
}

export function buildWelcomeEmail(lead: LeadRecord, appUrl: string, supportEmail: string): { subject: string; html: string; text: string } {
  const subject = 'Thanks for reaching out to AI Spend Audit'
  const html = renderLayout(
    'Thanks for reaching out',
    `
      <p>Hi${lead.company ? ` ${escapeHtml(lead.company)}` : ''}, thanks for sharing your details. We received <strong>${escapeHtml(lead.email)}</strong> and will keep you updated with the most relevant AI spend insights.</p>
      <p>Your audit is ready to share internally, and we can help turn it into a practical optimization plan when you are ready.</p>
      <a class="cta" href="${escapeHtml(appUrl)}">Open the app</a>
      <ul class="list">
        <li>Personalized cost visibility</li>
        <li>Repeatable recommendations</li>
        <li>Practical follow-up when savings are real</li>
      </ul>
      <p class="muted">If you did not request this, reply to <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
    `
  )

  const text = [
    'Thanks for reaching out to AI Spend Audit.',
    `We received ${lead.email}.`,
    `Open the app: ${appUrl}`,
    `Support: ${supportEmail}`
  ].join('\n\n')

  return { subject, html, text }
}

export function buildAuditReportEmail(params: {
  lead: LeadRecord
  reportRequest: ReportRequestRecord
  appUrl: string
  supportEmail: string
}): { subject: string; html: string; text: string } {
  const { lead, reportRequest, appUrl, supportEmail } = params
  const subject = `Your AI Spend Audit report${reportRequest.reportTitle ? `: ${reportRequest.reportTitle}` : ''}`
  const reportLink = reportRequest.reportUrl || appUrl

  const html = renderLayout(
    'Your audit report is ready',
    `
      <p>Hi${lead.company ? ` ${escapeHtml(lead.company)}` : ''}, your requested AI Spend Audit report is ready.</p>
      <p>This summary is built for quick review with stakeholders and includes your highest-leverage optimization opportunities.</p>
      <p><strong>Estimated next step:</strong> review the top recommendations, then book a short follow-up if you want help implementing them.</p>
      <a class="cta" href="${escapeHtml(reportLink)}">Open your report</a>
      <ul class="list">
        <li>Report request id: ${escapeHtml(reportRequest.id)}</li>
        <li>Share reference: ${escapeHtml(reportRequest.shareId || 'n/a')}</li>
      </ul>
      <p class="muted">Need a hand interpreting it? Email <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
    `
  )

  const text = [
    'Your AI Spend Audit report is ready.',
    `Open your report: ${reportLink}`,
    `Request id: ${reportRequest.id}`,
    `Support: ${supportEmail}`
  ].join('\n\n')

  return { subject, html, text }
}

export function buildFollowUpEmail(params: {
  lead: LeadRecord
  appUrl: string
  supportEmail: string
  consultationUrl: string
  projectedSavings?: number
}): { subject: string; html: string; text: string } {
  const { lead, appUrl, supportEmail, consultationUrl, projectedSavings } = params
  const subject = 'Next step on your AI spend optimization'
  const savingsCopy = typeof projectedSavings === 'number' ? `We estimated about $${formatMoney(projectedSavings)} in monthly savings.` : 'We found a meaningful opportunity to improve your AI spend posture.'

  const html = renderLayout(
    'A quick next step',
    `
      <p>Hi${lead.company ? ` ${escapeHtml(lead.company)}` : ''}, thanks again for the conversation request.</p>
      <p>${escapeHtml(savingsCopy)}</p>
      <p>If you want help prioritizing the highest-leverage actions, we can walk through implementation, vendor negotiation, and governance in one focused session.</p>
      <a class="cta" href="${escapeHtml(consultationUrl)}">Book a consultation</a>
      <p class="muted">You can also revisit the app anytime: <a href="${escapeHtml(appUrl)}">${escapeHtml(appUrl)}</a></p>
      <p class="muted">Questions? Reply to <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
    `
  )

  const text = [
    'Next step on your AI spend optimization.',
    savingsCopy,
    `Book a consultation: ${consultationUrl}`,
    `Open the app: ${appUrl}`,
    `Support: ${supportEmail}`
  ].join('\n\n')

  return { subject, html, text }
}
