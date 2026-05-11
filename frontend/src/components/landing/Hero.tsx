import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden pt-16 pb-8 md:pt-0 md:pb-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      
      <div className="container px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-100/80 px-4 py-2 backdrop-blur-sm dark:bg-cyan-900/30"
          >
            <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Introducing AI Spend Auditor</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-5 leading-tight"
          >
            Audit your AI <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">spending in minutes</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed"
          >
            Discover hidden costs, optimize token usage, and reclaim <span className="font-semibold text-slate-900 dark:text-white">30-40% of your AI budget</span> with enterprise-grade automated audits.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
          >
            <Link to="/audit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 active:scale-95 hover:from-cyan-600 hover:to-indigo-600 hover:shadow-xl hover:shadow-cyan-500/25 sm:w-auto md:px-8 md:py-4 md:text-base">
              Get Started Free
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full rounded-xl bg-white px-6 py-3 text-center font-semibold text-primary shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:bg-slate-50 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800/80 sm:w-auto md:px-8 md:py-4 md:text-base">
              Explore features
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm md:text-base text-slate-500 dark:text-slate-400"
          >
            ✓ No credit card required · ✓ 7-day free trial · ✓ Enterprise security (SOC2)
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
