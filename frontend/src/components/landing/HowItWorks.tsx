import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Connect Your Accounts',
    description: 'Add your OpenAI, Anthropic, and other AI provider credentials (read-only, encrypted).'
  },
  {
    number: '02',
    title: 'Run Your First Audit',
    description: 'Our engine analyzes your usage patterns, identifies anomalies, and detects optimization opportunities.'
  },
  {
    number: '03',
    title: 'Get Insights & Recommendations',
    description: 'View detailed reports with actionable recommendations and projected savings.'
  },
  {
    number: '04',
    title: 'Implement & Monitor',
    description: 'Execute recommendations, track savings in real-time, and stay on top of your budget.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-white dark:bg-slate-900">
      <div className="container px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">HOW IT WORKS</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get started in 4 simple steps.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={stepVariants} className="relative">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-12 top-12">
                  <ArrowRight className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
