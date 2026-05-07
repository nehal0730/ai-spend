import { Router } from 'express'
import supabase from '../lib/supabase'

const router = Router()

// POST /test-db -> insert a test row into test_audits
router.post('/', async (req, res, next) => {
  try {
    const { company_name, team_size } = req.body
    if (!company_name) return res.status(400).json({ error: 'company_name is required' })

    const payload = { company_name, team_size: team_size ?? null }
    const { data, error } = await supabase.from('test_audits').insert([payload]).select('*').limit(1)
    if (error) return next(error)
    return res.status(201).json({ created: data?.[0] })
  } catch (err) {
    next(err)
  }
})

// GET /test-db/:id -> fetch back the row
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const { data, error } = await supabase.from('test_audits').select('*').eq('id', id).limit(1)
    if (error) return next(error)
    if (!data || data.length === 0) return res.status(404).json({ error: 'not_found' })
    return res.json({ row: data[0] })
  } catch (err) {
    next(err)
  }
})

export { router }
