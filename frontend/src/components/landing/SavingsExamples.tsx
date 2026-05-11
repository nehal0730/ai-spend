import React from 'react'
import { motion } from 'framer-motion'
import { TrendingDown } from 'lucide-react'

const examples = [
  {
    company: 'Series A Startup',
    issue: 'Redundant API calls from two separate services',
    before: '$8,500',
    after: '$5,200',
    savings: '$3,300 (39%)',
    period: '/month'
  },
  {
    company: 'Enterprise Customer',
    issue: 'Inefficient prompt engineering and retries',
    before: '$125,000',
    after: '$87,500',
    savings: '$37,500 (30%)',
    period: '/month',
    featured: true
  },
  {
    company: 'B2B SaaS',
    issue: 'Unused and over-provisioned models',
    before: '$18,000',
    after: '$10,800',
    savings: '$7,200 (40%)',
    period: '/month'
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function SavingsExamples() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
      <div className="container px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest">Real Results</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight">
            See what our customers are saving.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">Real audit results from teams just like yours</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
        >
          {examples.map((example, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className={`group relative rounded-2xl transition-all duration-300 ${
                example.featured
                  ? 'md:scale-105 bg-gradient-to-br from-white to-cyan-50/60 shadow-xl dark:from-slate-800 dark:to-blue-950/30 dark:shadow-lg dark:shadow-blue-900/30'
                  : 'bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:bg-slate-800/30 dark:hover:shadow-[0_18px_50px_rgba(2,6,23,0.25)]'
              }`}
            >
              {example.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-8 md:p-10">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900 dark:text-white">{example.company}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">{example.issue}</p>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Before Audit</p>
                    <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{example.before}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{example.period}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1 h-1 bg-green-200 dark:bg-green-900/30 rounded-full" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">After Audit</p>
                    <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">{example.after}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{example.period}</p>
                  </div>
                </div>
                
                <div className="pt-8">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-base md:text-lg font-bold text-green-600 dark:text-green-400">
                      {example.savings} saved monthly
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
