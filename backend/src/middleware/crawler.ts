import { Request } from 'express'

const crawlerSignatures = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'Slackbot',
  'LinkedInBot',
  'Discordbot',
  'WhatsApp',
  'TelegramBot',
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',
  'embedly',
  'quora link preview'
]

export function isCrawlerRequest(req: Request): boolean {
  const userAgent = String(req.get('user-agent') || '')
  const lower = userAgent.toLowerCase()

  if (crawlerSignatures.some((signature) => lower.includes(signature.toLowerCase()))) {
    return true
  }

  const accept = String(req.get('accept') || '')
  return accept.includes('text/html') && lower.length > 0 && lower.includes('bot')
}
