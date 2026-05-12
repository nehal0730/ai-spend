import { getApiBaseUrl } from './api-base'
import type {
  LeadCaptureApiEnvelope,
  LeadCaptureApiError,
  LeadCaptureContext,
  LeadCaptureMode,
  LeadCaptureSuccess
} from './lead-capture-types'

async function postLeadCapture(endpoint: string, payload: LeadCaptureContext): Promise<{ success: true; data: LeadCaptureSuccess } | { success: false; error: string }> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  } catch {
    return {
      success: false,
      error: 'Could not reach the lead capture service. Please try again in a moment.'
    }
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as LeadCaptureApiError | null
    return {
      success: false,
      error: errorPayload?.error || 'Your request could not be completed.'
    }
  }

  const data = (await response.json()) as LeadCaptureApiEnvelope
  return { success: true, data: data.data }
}

export async function submitLeadCapture(payload: LeadCaptureContext) {
  return postLeadCapture('/api/leads', payload)
}

export async function requestReportEmail(payload: LeadCaptureContext) {
  return postLeadCapture('/api/reports/email', payload)
}

export async function requestConsultation(payload: LeadCaptureContext) {
  return postLeadCapture('/api/contact', payload)
}

export function getLeadCaptureEndpoint(mode: LeadCaptureMode): '/api/leads' | '/api/reports/email' | '/api/contact' {
  switch (mode) {
    case 'report':
      return '/api/reports/email'
    case 'contact':
      return '/api/contact'
    default:
      return '/api/leads'
  }
}
