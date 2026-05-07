import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

export const validateBody = (schema: ZodSchema<any>) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body)
    return next()
  } catch (err: any) {
    return next({ status: 400, message: err.errors ? err.errors.map((e: any) => e.message).join(', ') : 'Invalid request' })
  }
}
