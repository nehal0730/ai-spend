import type { AuditReport } from './audit-types'
import type { AISpendFormValues } from './spend-form'

type ApiError = {
  error: string
  issues?: Array<{ message: string }>
}

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000'
}

export async function runRemoteAudit(formData: AISpendFormValues): Promise<{ success: true; report: AuditReport } | { success: false; error: string }> {
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

  const report = (await response.json()) as AuditReport
  return { success: true, report }
}