import React from 'react'
import Hero from '../components/landing/Hero'
import Problem from '../components/landing/Problem'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import SavingsExamples from '../components/landing/SavingsExamples'
import CTA from '../components/landing/CTA'
import FAQ from '../components/landing/FAQ'
import ContactCTA from '../components/lead-capture/ContactCTA'

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <SavingsExamples />
      <CTA />
      <div className="container px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <ContactCTA
          source="landing_page"
          title="Want a practical follow-up after the audit?"
          description="Leave your email and a short note. We will send a focused follow-up with next steps, recommendations, and implementation help."
        />
      </div>
      <FAQ />
    </main>
  )
}
