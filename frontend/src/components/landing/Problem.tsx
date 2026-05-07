import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, AlertCircle } from 'lucide-react'

const problems = [
  {
    icon: TrendingUp,
    title: 'Hidden Cost Explosion',
    description: 'Most teams don\'t know what they\'re actually spending on AI—costs are spread across accounts, tools, and departments.'
  },
  {
    icon: Zap,
    title: 'Inefficient Token Usage',
    description: 'Duplicate requests, unnecessary retries, and redundant API calls drain your budget without adding value.'
  },
  {
    icon: AlertCircle,
    title: 'No Visibility',
    description: 'Without audit trails and cost breakdowns, you can\'t pinpoint where money is wasted or optimize effectively.'
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Problem() {
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
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">THE PROBLEM</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Most teams are losing thousands on AI services.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Without visibility and optimization, AI costs spiral out of control.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {problems.map((problem, i) => {
            const Icon = problem.icon
            return (
              <motion.div key={i} variants={itemVariants} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
                <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{problem.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
