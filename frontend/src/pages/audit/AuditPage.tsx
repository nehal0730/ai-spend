import React from 'react'
import AuditHero from './AuditHero'
import AuditForm from './AuditForm'

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <AuditHero />
      <AuditForm />
    </main>
  )
}