import React from 'react'
import { motion } from 'framer-motion'

const examples = [
  {
    company: 'Series A Startup',
    issue: 'Redundant API calls from two separate services',
    before: '$8,500/month',
    after: '$5,200/month',
    savings: '$3,300/month (39%)'
  },
  {
    company: 'Enterprise Customer',
    issue: 'Inefficient prompt engineering and retries',
    before: '$125,000/month',
    after: '$87,500/month',
    savings: '$37,500/month (30%)'
  },
  {
    company: 'B2B SaaS',
    issue: 'Unused and over-provisioned models',
    before: '$18,000/month',
    after: '$10,800/month',
    savings: '$7,200/month (40%)'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function SavingsExamples() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
      <div className="container px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">REAL RESULTS</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See what our customers are saving.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {examples.map((example, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{example.company}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{example.issue}</p>
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Before</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{example.before}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">After</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{example.after}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-green-600 dark:text-green-400">{example.savings}</span> saved monthly
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
