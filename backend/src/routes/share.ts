import { Router } from 'express'
import { z } from 'zod'
import { isCrawlerRequest } from '../middleware/crawler'
import { buildFrontendShareUrl, renderShareHtml } from '../lib/share/metadata'
import {
  buildDynamicOgPng,
  buildDynamicOgSvg,
  getPublicAuditShare,
  getShareCardMetadata
} from '../lib/share/service'

const shareIdSchema = z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/)

function isUsableFrontendUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false

    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1') return false
    if (host.endsWith('.local') || host.includes('placeholder')) return false

    return true
  } catch {
    return false
  }
}

function parseShareId(value: string): string | null {
  const parsed = shareIdSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

const apiRouter = Router()

apiRouter.get('/:shareId', async (req, res) => {
  const shareId = parseShareId(req.params.shareId)
  if (!shareId) {
    return res.status(400).json({ error: 'Invalid share id' })
  }

  try {
    const share = await getPublicAuditShare(shareId)
    if (!share) {
      return res.status(404).json({ error: 'Shared report not found' })
    }

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
    return res.json({
      shareId: share.shareId,
      title: share.title,
      description: share.description,
      publishedAt: share.publishedAt,
      payload: share.reportPayload
    })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Could not fetch shared report' })
  }
})

apiRouter.get('/:shareId/og-image.svg', async (req, res) => {
  const shareId = parseShareId(req.params.shareId)
  if (!shareId) {
    return res.status(400).type('text/plain').send('Invalid share id')
  }

  try {
    const share = await getPublicAuditShare(shareId)
    if (!share) {
      return res.status(404).type('text/plain').send('Shared report not found')
    }

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    return res.send(buildDynamicOgSvg(share.reportPayload))
  } catch {
    return res.status(500).type('text/plain').send('Failed to render image')
  }
})

apiRouter.get('/:shareId/og-image.png', async (req, res) => {
  const shareId = parseShareId(req.params.shareId)
  if (!shareId) {
    return res.status(400).type('text/plain').send('Invalid share id')
  }

  try {
    const share = await getPublicAuditShare(shareId)
    if (!share) {
      return res.status(404).type('text/plain').send('Shared report not found')
    }

    const png = buildDynamicOgPng(share.reportPayload)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    return res.send(png)
  } catch {
    return res.status(500).type('text/plain').send('Failed to render image')
  }
})

const pageRouter = Router()

pageRouter.get('/:shareId', async (req, res) => {
  const shareId = parseShareId(req.params.shareId)
  if (!shareId) {
    return res.status(400).type('text/plain').send('Invalid share id')
  }

  try {
    const share = await getPublicAuditShare(shareId)
    if (!share) {
      return res.status(404).type('text/plain').send('Shared report not found')
    }

    if (!isCrawlerRequest(req)) {
      const frontendUrl = buildFrontendShareUrl(shareId)
      const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
      if (isUsableFrontendUrl(frontendUrl) && frontendUrl !== currentUrl) {
        return res.redirect(302, frontendUrl)
      }
    }

    const metadata = getShareCardMetadata(share.reportPayload)
    const frontendUrl = buildFrontendShareUrl(shareId)
    const html = renderShareHtml(metadata, share.reportPayload, isUsableFrontendUrl(frontendUrl) ? frontendUrl : null)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
    return res.send(html)
  } catch {
    return res.status(500).type('text/plain').send('Unable to load shared report')
  }
})

export { apiRouter as shareApiRouter, pageRouter as sharePageRouter }
