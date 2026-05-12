require('dotenv').config({ path: require('path').join(process.cwd(), '.env') })
const { Client } = require('pg')

async function apiSmoke() {
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:5000'
  const results = []

  const reportPayload = {
    email: `smoke-report+${Date.now()}@example.com`,
    source: 'audit_results',
    reportTitle: 'Smoke API Report',
    reportUrl: 'http://localhost/report/123'
  }

  const leadPayload = {
    email: `smoke-lead+${Date.now()}@example.com`,
    source: 'landing_page',
    company: 'Smoke Co',
    role: 'QA'
  }

  try {
    console.log('Posting report email request to', base + '/api/reports/email')
    const r1 = await fetch(base + '/api/reports/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportPayload)
    })
    const jr1 = await r1.json().catch(() => null)
    console.log('Report response', r1.status, jr1)
    results.push({ endpoint: '/api/reports/email', status: r1.status, body: jr1 })

    console.log('Posting lead request to', base + '/api/leads')
    const r2 = await fetch(base + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    })
    const jr2 = await r2.json().catch(() => null)
    console.log('Lead response', r2.status, jr2)
    results.push({ endpoint: '/api/leads', status: r2.status, body: jr2 })

    // allow a short delay for DB writes
    await new Promise((res) => setTimeout(res, 500))

    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL missing')
    const client = new Client({ connectionString: url })
    await client.connect()

    // check leads
    const leadsRes = await client.query('SELECT * FROM leads WHERE email = ANY($1)', [[leadPayload.email, reportPayload.email]])
    console.log('Leads rows found:', leadsRes.rowCount)
    console.dir(leadsRes.rows, { depth: null })

    // check report_requests (for reportPayload email we need to find by dedupe_key or report_url)
    const rr = await client.query('SELECT * FROM report_requests WHERE report_url = $1 OR share_id = $2', [reportPayload.reportUrl, reportPayload.shareId || null])
    console.log('Report requests rows found:', rr.rowCount)
    console.dir(rr.rows, { depth: null })

    // check email_events for recipient_email
    const ee = await client.query('SELECT * FROM email_events WHERE recipient_email = ANY($1)', [[reportPayload.email, leadPayload.email]])
    console.log('Email events rows found:', ee.rowCount)
    console.dir(ee.rows, { depth: null })

    await client.end()

    console.log('API smoke completed successfully')
    process.exit(0)
  } catch (err) {
    console.error('API smoke failed:', err.message)
    process.exit(1)
  }
}

apiSmoke()
