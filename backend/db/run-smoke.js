#!/usr/bin/env node
const { Client } = require('pg')

async function smoke() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('Please set DATABASE_URL environment variable')
    process.exit(1)
  }
  const client = new Client({ connectionString: url })
  await client.connect()

  try {
    await client.query('BEGIN')
    const sessionRes = await client.query("INSERT INTO audit_sessions (title) VALUES ($1) RETURNING id", ['smoke-session'])
    const sessionId = sessionRes.rows[0].id

    const toolRes = await client.query("SELECT id FROM tool_catalog WHERE tool_key = $1 LIMIT 1", ['security_headers'])
    if (toolRes.rowCount === 0) {
      throw new Error('tool_catalog missing seed data; run migrations with seeds')
    }
    const toolId = toolRes.rows[0].id

    const selRes = await client.query(
      "INSERT INTO audit_session_tool_selections (session_id, tool_id, selection_order) VALUES ($1,$2,1) RETURNING id",
      [sessionId, toolId]
    )
    const selectionId = selRes.rows[0].id

    await client.query(
      "INSERT INTO audit_results (session_id, session_tool_selection_id, result_key, result_value) VALUES ($1,$2,$3,$4)",
      [sessionId, selectionId, 'headers_missing', { missing: ['X-Frame-Options'] }]
    )

    await client.query("INSERT INTO ai_summaries (session_id, content) VALUES ($1, $2)", [sessionId, 'Smoke test summary'])
    await client.query('COMMIT')

    const results = await client.query('SELECT id, result_key, result_value FROM audit_results WHERE session_id = $1', [sessionId])
    console.log('Smoke test successful. Results:')
    console.dir(results.rows, { depth: null })
  } catch (err) {
    console.error('Smoke test failed:', err.message)
    await client.query('ROLLBACK').catch(() => {})
    process.exit(1)
  } finally {
    await client.end()
  }
}

smoke().catch(err => {
  console.error(err)
  process.exit(1)
})
