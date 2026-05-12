import type { AnalyzeAuditResponse, SharedAuditApiResponse } from './audit-types'
import { getApiBaseUrl } from './api-base'
import type { AISpendFormValues } from './spend-form'

type ApiError = {
  error: string
  issues?: Array<{ message: string }>
}

export async function runRemoteAudit(formData: AISpendFormValues): Promise<{ success: true; data: AnalyzeAuditResponse } | { success: false; error: string }> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}/audit/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
  } catch {
    return {
      success: false,
      error: 'Could not reach the audit backend. Start the backend server and try again.'
    }
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiError | null
    return {
      success: false,
      error: errorPayload?.error || `Audit request failed with status ${response.status}`
    }
  }

  const data = (await response.json()) as AnalyzeAuditResponse
  return { success: true, data }
}

export async function fetchSharedAuditReport(shareId: string): Promise<{ success: true; data: SharedAuditApiResponse } | { success: false; error: string }> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}/api/share/${encodeURIComponent(shareId)}`)
  } catch {
    return {
      success: false,
      error: 'Could not reach the backend. Please try again in a moment.'
    }
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiError | null
    return {
      success: false,
      error: errorPayload?.error || 'Shared audit not found.'
    }
  }

  const data = (await response.json()) as SharedAuditApiResponse
  return { success: true, data }
}