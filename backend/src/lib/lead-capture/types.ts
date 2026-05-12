export type LeadSource = 'landing_page' | 'audit_page' | 'audit_results' | 'share_page' | 'contact_widget'

export type LeadStatus = 'new' | 'subscribed' | 'engaged' | 'converted' | 'suppressed'

export type ReportRequestStatus = 'pending' | 'queued' | 'sent' | 'failed' | 'deduped'

export type ReportRequestType = 'audit_report' | 'updates' | 'share_delivery' | 'consultation'

export type EmailEventKind = 'welcome' | 'audit_report' | 'follow_up' | 'share_delivery' | 'blocked' | 'failed'

export type EmailEventStatus = 'queued' | 'sent' | 'failed' | 'suppressed'

export interface LeadMetadata {
  company?: string
  role?: string
  teamSize?: number
  requestCount?: number
  shareId?: string
  reportUrl?: string
  sourceContext?: Record<string, unknown>
}

export interface LeadSubmissionInput {
  email: string
  company?: string
  role?: string
  teamSize?: number
  source: LeadSource
  message?: string
  shareId?: string
  reportTitle?: string
  reportUrl?: string
  honeypot?: string
  startedAt?: string
}

export interface RequestContext {
  requestId: string
  ipAddress: string | null
  ipHash: string | null
  userAgent: string | null
  referer: string | null
  origin: string | null
}

export interface LeadRecord {
  id: string
  email: string
  normalizedEmail: string
  company: string | null
  role: string | null
  teamSize: number | null
  source: LeadSource
  status: LeadStatus
  metadata: LeadMetadata
  firstSeenAt: string
  lastSeenAt: string
  createdAt: string
  updatedAt: string
}

export interface ReportRequestRecord {
  id: string
  leadId: string
  requestType: ReportRequestType
  status: ReportRequestStatus
  source: LeadSource
  shareId: string | null
  reportTitle: string | null
  reportUrl: string | null
  dedupeKey: string
  requestIpHash: string | null
  requestUserAgent: string | null
  requestReferer: string | null
  metadata: Record<string, unknown>
  requestedAt: string
  processedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EmailEventRecord {
  id: string
  leadId: string
  reportRequestId: string | null
  kind: EmailEventKind
  status: EmailEventStatus
  provider: string
  providerMessageId: string | null
  recipientEmail: string
  subject: string
  templateKey: string
  source: LeadSource
  requestIpHash: string | null
  requestUserAgent: string | null
  requestReferer: string | null
  metadata: Record<string, unknown>
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LeadAdminSummary {
  lead: LeadRecord
  reportRequests: ReportRequestRecord[]
  emailEvents: EmailEventRecord[]
}

export interface LeadResultResponse {
  leadId: string
  status: 'created' | 'updated' | 'deduped'
  message: string
  emailSent: boolean
  emailEventId?: string
  reportRequestId?: string
}
