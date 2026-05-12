import { NextFunction, Request, Response } from 'express'
import { getOptionalEnv } from '../lib/env'

export function requireAdminToken(req: Request, res: Response, next: NextFunction) {
  const expectedToken = getOptionalEnv('ADMIN_API_TOKEN')

  if (!expectedToken) {
    return next({ status: 500, message: 'ADMIN_API_TOKEN is not configured' })
  }

  const headerToken = req.header('x-admin-token') || req.header('authorization')?.replace(/^Bearer\s+/i, '')

  if (headerToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return next()
}
