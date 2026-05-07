import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-0">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -z-10" />
      <div className="container px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Audit your AI spending in <span className="text-blue-600 dark:text-blue-400">minutes</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover hidden costs, optimize token usage, and reclaim 30-40% of your AI budget with automated audits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
              Get Started Free
              <ChevronRight size={18} />
            </button>
            <button className="px-8 py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">
            No credit card required. 7-day free trial.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
