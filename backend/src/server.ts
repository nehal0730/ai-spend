import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { json, urlencoded } from 'express'
import { router as healthRouter } from './routes/health'
import { router as testDbRouter } from './routes/testDb'
import { router as testDbSimpleRouter } from './routes/testDbSimple'
import { auditRouter } from './routes/audit'
import { leadRouter } from './routes/leads'
import { shareApiRouter, sharePageRouter } from './routes/share'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean) : true,
  credentials: true
}))
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

app.use('/health', healthRouter)
app.use('/test', testDbRouter)
app.use('/test-db', testDbSimpleRouter)
app.use('/audit', auditRouter)
app.use('/api', leadRouter)
app.use('/api/share', shareApiRouter)
app.use('/share', sharePageRouter)

app.use(errorHandler)

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

export default app
