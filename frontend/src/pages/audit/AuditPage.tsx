import React from 'react'
import AuditHero from './AuditHero'
import AuditForm from './AuditForm'
import ContactCTA from '../../components/lead-capture/ContactCTA'

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-app text-primary">
      <AuditHero />
      <AuditForm />
      <div className="container px-4 pb-16 md:px-6 lg:px-8">
        <ContactCTA
          source="audit_page"
          title="Need a consultation after you run the audit?"
          description="Share a few details and we will send a follow-up email with practical recommendations and implementation options."
          submitLabel="Request a consult"
          className="mt-8"
        />
      </div>
    </main>
  )
}