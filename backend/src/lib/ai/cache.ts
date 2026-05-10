import crypto from 'crypto'

export type CachedSummary = {
  summary: string
  fallback: boolean
}

type CacheEntry = {
  value: CachedSummary
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const DEFAULT_TTL_MS = 1000 * 60 * 60 // 1 hour

export function makeKey(obj: unknown) {
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj)
  return crypto.createHash('sha256').update(s).digest('hex')
}

export function getFromCache(key: string) {
  const e = cache.get(key)
  if (!e) return null
  if (Date.now() > e.expiresAt) {
    cache.delete(key)
    return null
  }
  return e.value
}

export function setCache(key: string, value: CachedSummary, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function clearCache() {
  cache.clear()
}

export default {
  makeKey,
  getFromCache,
  setCache,
  clearCache
}
