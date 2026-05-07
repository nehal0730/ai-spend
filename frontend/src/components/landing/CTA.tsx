import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-20 md:py-28 bg-blue-600 dark:bg-blue-900">
      <div className="container px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Reclaim your AI budget today.
          </h2>
          <p className="text-lg text-blue-100 mb-10">
            Join hundreds of companies already optimizing their AI spend.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
              Get Started Free
              <ChevronRight size={18} />
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Schedule a Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
