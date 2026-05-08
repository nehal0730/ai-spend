import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Zap, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Cost Tracking',
    description: 'See exactly where every dollar goes across your entire AI stack with live dashboard updates.'
  },
  {
    icon: Zap,
    title: 'Automated Optimization',
    description: 'Get instant recommendations to cut waste, reduce redundancy, and improve efficiency.'
  },
  {
    icon: CheckCircle,
    title: 'Multi-provider Support',
    description: 'Audit OpenAI, Anthropic, Google Cloud, Azure, and more from one unified dashboard.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 compliant with zero data retention, encrypted audit logs, and role-based access.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
}

export default function Features() {
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
          <p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest">Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight">
            Built for teams who care about efficiency.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-10 md:gap-12 max-w-4xl mx-auto"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div key={i} variants={itemVariants} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
