import { Router } from 'express'
import supabase from '../lib/supabaseClient'

const router = Router()

// POST /test/audit -> create a sample audit_sessions row and return it
router.post('/audit', async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title ?? 'Test Audit',
      description: req.body.description ?? 'Created by test route'
    }

    const { data, error } = await supabase.from('audit_sessions').insert([payload]).select('*').limit(1)
    if (error) return next(error)
    return res.status(201).json({ created: data?.[0] })
  } catch (err) {
    return next(err)
  }
})

// GET /test/audit/:id -> fetch audit session by id
router.get('/audit/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const { data, error } = await supabase.from('audit_sessions').select('*').eq('id', id).limit(1)
    if (error) return next(error)
    if (!data || data.length === 0) return res.status(404).json({ error: 'not_found' })
    return res.json({ session: data[0] })
  } catch (err) {
    return next(err)
  }
})

export { router }
