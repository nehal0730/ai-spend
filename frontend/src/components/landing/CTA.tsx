import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      
      <div className="container px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight"
          >
            Ready to reclaim your AI budget?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-blue-50 mb-10 leading-relaxed"
          >
            Join hundreds of teams saving thousands on AI infrastructure. Get your free audit in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/audit" className="group px-8 md:px-10 py-4 md:py-5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl active:scale-95 w-full sm:w-auto justify-center md:text-lg">
              Get Started Free
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#faq" className="px-8 md:px-10 py-4 md:py-5 border-2 border-white text-white hover:bg-white/10 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center md:text-lg">
              Schedule Demo
              <ArrowRight size={20} />
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm md:text-base text-blue-100 mt-8"
          >
            ✓ No credit card required · ✓ 7-day free trial · ✓ Full feature access
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
