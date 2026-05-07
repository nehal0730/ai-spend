#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('Please set DATABASE_URL environment variable (postgres://user:pass@host:port/db)')
    process.exit(1)
  }

  const client = new Client({ connectionString: url })
  await client.connect()

  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const full = path.join(migrationsDir, file)
    console.log(`Applying ${file}...`)
    const sql = fs.readFileSync(full, 'utf8')
    try {
      await client.query(sql)
      console.log(`Applied ${file}`)
    } catch (err) {
      console.error(`Failed migration ${file}:`, err.message)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()
  console.log('All migrations applied successfully')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
