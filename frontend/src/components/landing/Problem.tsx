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
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function Problem() {
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
          <p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest">The Problem</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight">
            Most teams are losing thousands on AI services.
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Without visibility and optimization, AI costs spiral out of control.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 md:gap-8"
        >
          {problems.map((problem, i) => {
            const Icon = problem.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:bg-slate-800/50 dark:hover:shadow-[0_18px_50px_rgba(2,6,23,0.35)] md:p-8 backdrop-blur-sm"
              >
                <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors mb-4">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-slate-900 dark:text-white">{problem.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{problem.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
