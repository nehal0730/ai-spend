export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value || undefined
}

export function getOptionalNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim()
  if (!rawValue) {
    return fallback
  }

  const parsed = Number(rawValue)
  return Number.isFinite(parsed) ? parsed : fallback
}
