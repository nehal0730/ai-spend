import { createHash } from 'crypto'
import supabase from '../supabase'
import logger from '../../utils/logger'
import { getOptionalEnv } from '../env'
import { getConsultationUrl, getSupportEmail, sendTransactionalEmail } from './email'
import { buildAuditReportEmail, buildFollowUpEmail, buildWelcomeEmail } from './templates'
import type {
  EmailEventRecord,
  EmailEventStatus,
  EmailEventKind,
  LeadAdminSummary,
  LeadRecord,
  LeadResultResponse,
  LeadSource,
  RequestContext,
  ReportRequestRecord,
  ReportRequestStatus,
  ReportRequestType
} from './types'
import type { ContactFormInput, LeadCaptureFormInput, ReportEmailFormInput } from './validation'

const LEADS_TABLE = 'leads'
const REPORT_REQUESTS_TABLE = 'report_requests'
const EMAIL_EVENTS_TABLE = 'email_events'

// previously defined hashValue was removed because it was unused

function buildDedupeKey(input: {
  email: string
  requestType: ReportRequestType
  source: LeadSource
  shareId?: string
  reportUrl?: string
  message?: string
}): string {
  return createHash('sha256')
    .update([input.email, input.requestType, input.source, input.shareId || '', input.reportUrl || '', input.message || ''].join('|'))
    .digest('hex')
}

function sanitizeLeadInput(input: LeadCaptureFormInput | ReportEmailFormInput | ContactFormInput) {
  return {
    email: input.email,
    company: input.company || null,
    role: input.role || null,
    teamSize: typeof input.teamSize === 'number' ? input.teamSize : null,
    source: input.source,
    message: input.message || null,
    shareId: input.shareId || null,
    reportTitle: input.reportTitle || null,
    reportUrl: input.reportUrl || null,
    honeypot: input.honeypot || null,
    startedAt: input.startedAt || null
  }
}

function assertNotSpam(input: { honeypot?: string | null; startedAt?: string | null; message?: string | null }): void {
  if (input.honeypot && input.honeypot.trim().length > 0) {
    throw Object.assign(new Error('Submission rejected by anti-spam protection'), { status: 400 })
  }

  if (input.startedAt) {
    const startedAt = new Date(input.startedAt).getTime()
    if (!Number.isNaN(startedAt) && Date.now() - startedAt < 4000) {
      throw Object.assign(new Error('Please take a moment before submitting this form.'), { status: 429 })
    }
  }

  if (input.message) {
    const urlCount = (input.message.match(/https?:\/\//gi) || []).length
    if (urlCount > 3) {
      throw Object.assign(new Error('Message looks suspicious.'), { status: 400 })
    }
  }
}

async function getLeadByEmail(email: string): Promise<LeadRecord | null> {
  const { data, error } = await supabase.from(LEADS_TABLE).select('*').eq('normalized_email', email).maybeSingle()

  if (error) {
    throw new Error(`Failed to look up lead: ${error.message}`)
  }

  return data ? mapLeadRow(data) : null
}

function mapLeadRow(row: any): LeadRecord {
  return {
    id: row.id,
    email: row.email,
    normalizedEmail: row.normalized_email,
    company: row.company,
    role: row.role,
    teamSize: row.team_size,
    source: row.source,
    status: row.status,
    metadata: row.metadata ?? {},
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapReportRequestRow(row: any): ReportRequestRecord {
  return {
    id: row.id,
    leadId: row.lead_id,
    requestType: row.request_type,
    status: row.status,
    source: row.source,
    shareId: row.share_id,
    reportTitle: row.report_title,
    reportUrl: row.report_url,
    dedupeKey: row.dedupe_key,
    requestIpHash: row.request_ip_hash,
    requestUserAgent: row.request_user_agent,
    requestReferer: row.request_referer,
    metadata: row.metadata ?? {},
    requestedAt: row.requested_at,
    processedAt: row.processed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapEmailEventRow(row: any): EmailEventRecord {
  return {
    id: row.id,
    leadId: row.lead_id,
    reportRequestId: row.report_request_id,
    kind: row.kind,
    status: row.status,
    provider: row.provider,
    providerMessageId: row.provider_message_id,
    recipientEmail: row.recipient_email,
    subject: row.subject,
    templateKey: row.template_key,
    source: row.source,
    requestIpHash: row.request_ip_hash,
    requestUserAgent: row.request_user_agent,
    requestReferer: row.request_referer,
    metadata: row.metadata ?? {},
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function upsertLead(input: ReturnType<typeof sanitizeLeadInput>, context: RequestContext): Promise<{ lead: LeadRecord; created: boolean }> {
  const nowIso = new Date().toISOString()
  const existing = await getLeadByEmail(input.email)
  const metadata = {
    ...(existing?.metadata ?? {}),
    company: input.company || existing?.metadata?.company || undefined,
    role: input.role || existing?.metadata?.role || undefined,
    teamSize: input.teamSize || existing?.metadata?.teamSize || undefined,
    sourceContext: {
      ...(existing?.metadata?.sourceContext as Record<string, unknown> | undefined),
      requestId: context.requestId,
      userAgent: context.userAgent,
      referer: context.referer,
      origin: context.origin
    }
  }

  if (existing) {
    const { data, error } = await supabase
      .from(LEADS_TABLE)
      .update({
        email: input.email,
        company: input.company ?? existing.company,
        role: input.role ?? existing.role,
        team_size: input.teamSize ?? existing.teamSize,
        source: input.source,
        status: existing.status === 'suppressed' ? 'suppressed' : existing.status,
        metadata,
        last_seen_at: nowIso
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error || !data) {
      throw new Error(`Failed to update lead: ${error?.message || 'missing row'}`)
    }

    return { lead: mapLeadRow(data), created: false }
  }

  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .insert({
      email: input.email,
      normalized_email: input.email,
      company: input.company,
      role: input.role,
      team_size: input.teamSize,
      source: input.source,
      status: 'new',
      metadata,
      first_seen_at: nowIso,
      last_seen_at: nowIso
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create lead: ${error?.message || 'missing row'}`)
  }

  return { lead: mapLeadRow(data), created: true }
}

async function insertEmailEvent(params: {
  leadId: string
  reportRequestId?: string | null
  kind: EmailEventKind
  status: EmailEventStatus
  recipientEmail: string
  subject: string
  templateKey: string
  source: LeadSource
  context: RequestContext
  metadata?: Record<string, unknown>
  providerMessageId?: string | null
  sentAt?: string | null
}): Promise<EmailEventRecord> {
  const payload = {
    lead_id: params.leadId,
    report_request_id: params.reportRequestId ?? null,
    kind: params.kind,
    status: params.status,
    provider: 'resend',
    provider_message_id: params.providerMessageId ?? null,
    recipient_email: params.recipientEmail,
    subject: params.subject,
    template_key: params.templateKey,
    source: params.source,
    request_ip_hash: params.context.ipHash,
    request_user_agent: params.context.userAgent,
    request_referer: params.context.referer,
    metadata: params.metadata ?? {},
    sent_at: params.sentAt ?? null
  }

  const { data, error } = await supabase.from(EMAIL_EVENTS_TABLE).insert(payload).select('*').single()

  if (error || !data) {
    throw new Error(`Failed to record email event: ${error?.message || 'missing row'}`)
  }

  return mapEmailEventRow(data)
}

async function insertReportRequest(params: {
  lead: LeadRecord
  requestType: ReportRequestType
  source: LeadSource
  shareId?: string | null
  reportTitle?: string | null
  reportUrl?: string | null
  context: RequestContext
  metadata?: Record<string, unknown>
  message?: string | null
}): Promise<{ reportRequest: ReportRequestRecord; deduped: boolean }> {
  const dedupeKey = buildDedupeKey({
    email: params.lead.normalizedEmail,
    requestType: params.requestType,
    source: params.source,
    shareId: params.shareId ?? undefined,
    reportUrl: params.reportUrl ?? undefined,
    message: params.message ?? undefined
  })

  const { data: existing, error: existingError } = await supabase
    .from(REPORT_REQUESTS_TABLE)
    .select('*')
    .eq('dedupe_key', dedupeKey)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Failed to inspect report request history: ${existingError.message}`)
  }

  if (existing) {
    return { reportRequest: mapReportRequestRow(existing), deduped: true }
  }

  const { data, error } = await supabase
    .from(REPORT_REQUESTS_TABLE)
    .insert({
      lead_id: params.lead.id,
      request_type: params.requestType,
      status: 'pending',
      source: params.source,
      share_id: params.shareId ?? null,
      report_title: params.reportTitle ?? null,
      report_url: params.reportUrl ?? null,
      dedupe_key: dedupeKey,
      request_ip_hash: params.context.ipHash,
      request_user_agent: params.context.userAgent,
      request_referer: params.context.referer,
      metadata: params.metadata ?? {},
      requested_at: new Date().toISOString()
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create report request: ${error?.message || 'missing row'}`)
  }

  return { reportRequest: mapReportRequestRow(data), deduped: false }
}

function getAppUrl(): string {
  return getOptionalEnv('APP_URL') || getOptionalEnv('FRONTEND_BASE_URL') || 'http://localhost:5173'
}

async function updateReportRequestStatus(reportRequestId: string, status: ReportRequestStatus): Promise<void> {
  const { error } = await supabase
    .from(REPORT_REQUESTS_TABLE)
    .update({
      status,
      processed_at: new Date().toISOString()
    })
    .eq('id', reportRequestId)

  if (error) {
    throw new Error(`Failed to update report request status: ${error.message}`)
  }
}

function buildLeadResponse(params: {
  lead: LeadRecord
  created: boolean
  emailSent: boolean
  emailEventId?: string
  reportRequestId?: string
  deduped?: boolean
  message: string
}): LeadResultResponse {
  return {
    leadId: params.lead.id,
    status: params.deduped ? 'deduped' : params.created ? 'created' : 'updated',
    message: params.message,
    emailSent: params.emailSent,
    emailEventId: params.emailEventId,
    reportRequestId: params.reportRequestId
  }
}

export async function submitLeadCapture(input: LeadCaptureFormInput, context: RequestContext): Promise<LeadResultResponse> {
  const sanitized = sanitizeLeadInput(input)
  assertNotSpam(sanitized)

  const { lead, created } = await upsertLead(sanitized, context)
  const shouldSendWelcome = created || lead.status === 'new'

  let emailEventId: string | undefined
  let emailSent = false

  if (shouldSendWelcome) {
    const supportEmail = getSupportEmail()
    const welcomeEmail = buildWelcomeEmail(lead, getAppUrl(), supportEmail)
    const emailSendResult = await sendTransactionalEmail({
      to: lead.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      text: welcomeEmail.text,
      replyTo: supportEmail
    })

    const emailEvent = await insertEmailEvent({
      leadId: lead.id,
      kind: 'welcome',
      status: emailSendResult.skipped ? 'queued' : 'sent',
      recipientEmail: lead.email,
      subject: welcomeEmail.subject,
      templateKey: 'lead-welcome',
      source: sanitized.source,
      context,
      metadata: {
        company: sanitized.company,
        role: sanitized.role,
        teamSize: sanitized.teamSize,
        skippedProvider: emailSendResult.skipped
      },
      providerMessageId: emailSendResult.providerMessageId,
      sentAt: new Date().toISOString()
    })

    emailEventId = emailEvent.id
    emailSent = true

    await supabase
      .from(LEADS_TABLE)
      .update({ status: 'subscribed' })
      .eq('id', lead.id)
  }

  logger.info('lead.capture', {
    leadId: lead.id,
    created,
    emailSent,
    source: sanitized.source,
    requestId: context.requestId
  })

  return buildLeadResponse({
    lead,
    created,
    emailSent,
    emailEventId,
    message: shouldSendWelcome ? 'Thanks. We sent a confirmation email.' : 'We already have this lead and updated the latest details.'
  })
}

export async function requestAuditReport(input: ReportEmailFormInput, context: RequestContext): Promise<LeadResultResponse> {
  const sanitized = sanitizeLeadInput(input)
  assertNotSpam(sanitized)

  const { lead, created } = await upsertLead(sanitized, context)
  const { reportRequest, deduped } = await insertReportRequest({
    lead,
    requestType: 'audit_report',
    source: sanitized.source,
    shareId: sanitized.shareId,
    reportTitle: sanitized.reportTitle,
    reportUrl: sanitized.reportUrl,
    context,
    metadata: {
      company: sanitized.company,
      role: sanitized.role,
      teamSize: sanitized.teamSize,
      message: sanitized.message,
      requestPath: 'reports/email'
    },
    message: sanitized.message
  })

  if (deduped) {
    return buildLeadResponse({
      lead,
      created,
      emailSent: false,
      reportRequestId: reportRequest.id,
      deduped: true,
      message: 'We already received this request recently. No duplicate email was sent.'
    })
  }

  const supportEmail = getSupportEmail()
  const auditReportEmail = buildAuditReportEmail({
    lead,
    reportRequest,
    appUrl: sanitized.reportUrl || getAppUrl(),
    supportEmail
  })

  const emailSendResult = await sendTransactionalEmail({
    to: lead.email,
    subject: auditReportEmail.subject,
    html: auditReportEmail.html,
    text: auditReportEmail.text,
    replyTo: supportEmail
  })

  const emailEvent = await insertEmailEvent({
    leadId: lead.id,
    reportRequestId: reportRequest.id,
    kind: 'audit_report',
    status: emailSendResult.skipped ? 'queued' : 'sent',
    recipientEmail: lead.email,
    subject: auditReportEmail.subject,
    templateKey: 'audit-report',
    source: sanitized.source,
    context,
    metadata: {
      shareId: sanitized.shareId,
      reportTitle: sanitized.reportTitle,
      reportUrl: sanitized.reportUrl,
      skippedProvider: emailSendResult.skipped
    },
    providerMessageId: emailSendResult.providerMessageId,
    sentAt: new Date().toISOString()
  })

  await updateReportRequestStatus(reportRequest.id, 'sent')

  logger.info('lead.report_request', {
    leadId: lead.id,
    reportRequestId: reportRequest.id,
    emailEventId: emailEvent.id,
    requestId: context.requestId
  })

  return buildLeadResponse({
    lead,
    created,
    emailSent: true,
    emailEventId: emailEvent.id,
    reportRequestId: reportRequest.id,
    message: 'Your report email is on the way.'
  })
}

export async function requestContactFollowUp(input: ContactFormInput, context: RequestContext): Promise<LeadResultResponse> {
  const sanitized = sanitizeLeadInput(input)
  assertNotSpam(sanitized)

  const { lead, created } = await upsertLead(sanitized, context)
  const { reportRequest, deduped } = await insertReportRequest({
    lead,
    requestType: 'consultation',
    source: sanitized.source,
    shareId: sanitized.shareId,
    reportTitle: sanitized.reportTitle,
    reportUrl: sanitized.reportUrl,
    context,
    metadata: {
      company: sanitized.company,
      role: sanitized.role,
      teamSize: sanitized.teamSize,
      message: sanitized.message,
      requestPath: 'contact'
    },
    message: sanitized.message
  })

  if (deduped) {
    return buildLeadResponse({
      lead,
      created,
      emailSent: false,
      reportRequestId: reportRequest.id,
      deduped: true,
      message: 'We already have your consultation request.'
    })
  }

  const supportEmail = getSupportEmail()
  const consultationUrl = getConsultationUrl()
  const followUpEmail = buildFollowUpEmail({
    lead,
    appUrl: getAppUrl(),
    supportEmail,
    consultationUrl,
    projectedSavings: typeof sanitized.teamSize === 'number' ? sanitized.teamSize * 150 : undefined
  })

  const emailSendResult = await sendTransactionalEmail({
    to: lead.email,
    subject: followUpEmail.subject,
    html: followUpEmail.html,
    text: followUpEmail.text,
    replyTo: supportEmail
  })

  const emailEvent = await insertEmailEvent({
    leadId: lead.id,
    reportRequestId: reportRequest.id,
    kind: 'follow_up',
    status: emailSendResult.skipped ? 'queued' : 'sent',
    recipientEmail: lead.email,
    subject: followUpEmail.subject,
    templateKey: 'follow-up',
    source: sanitized.source,
    context,
    metadata: {
      consultationUrl,
      skippedProvider: emailSendResult.skipped
    },
    providerMessageId: emailSendResult.providerMessageId,
    sentAt: new Date().toISOString()
  })

  await updateReportRequestStatus(reportRequest.id, 'sent')

  logger.info('lead.contact_request', {
    leadId: lead.id,
    reportRequestId: reportRequest.id,
    emailEventId: emailEvent.id,
    requestId: context.requestId
  })

  return buildLeadResponse({
    lead,
    created,
    emailSent: true,
    emailEventId: emailEvent.id,
    reportRequestId: reportRequest.id,
    message: 'Thanks. We sent a follow-up email and consultation link.'
  })
}

export async function getLeadAdminSummary(leadId: string): Promise<LeadAdminSummary | null> {
  const { data: leadRow, error: leadError } = await supabase.from(LEADS_TABLE).select('*').eq('id', leadId).maybeSingle()

  if (leadError) {
    throw new Error(`Failed to load lead: ${leadError.message}`)
  }

  if (!leadRow) {
    return null
  }

  const [reportRequests, emailEvents] = await Promise.all([
    supabase.from(REPORT_REQUESTS_TABLE).select('*').eq('lead_id', leadId).order('created_at', { ascending: false }).limit(20),
    supabase.from(EMAIL_EVENTS_TABLE).select('*').eq('lead_id', leadId).order('created_at', { ascending: false }).limit(20)
  ])

  if (reportRequests.error) {
    throw new Error(`Failed to load report requests: ${reportRequests.error.message}`)
  }

  if (emailEvents.error) {
    throw new Error(`Failed to load email events: ${emailEvents.error.message}`)
  }

  return {
    lead: mapLeadRow(leadRow),
    reportRequests: (reportRequests.data || []).map(mapReportRequestRow),
    emailEvents: (emailEvents.data || []).map(mapEmailEventRow)
  }
}
