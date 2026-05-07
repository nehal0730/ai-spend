import React from 'react'
import Hero from '../components/landing/Hero'
import Problem from '../components/landing/Problem'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import SavingsExamples from '../components/landing/SavingsExamples'
import CTA from '../components/landing/CTA'
import FAQ from '../components/landing/FAQ'

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <SavingsExamples />
      <CTA />
      <FAQ />
    </main>
  )
}
