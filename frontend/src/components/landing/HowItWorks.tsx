import React from 'react'
import { motion } from 'framer-motion'

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
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
}

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest">How It Works</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight">
            Get started in 4 simple steps.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 md:gap-10 max-w-5xl mx-auto"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={stepVariants} className="relative">
              <div className="flex gap-3 md:gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 font-black text-xl">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
