import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Zap, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Cost Tracking',
    description: 'See exactly where every dollar goes across your entire AI stack.'
  },
  {
    icon: Zap,
    title: 'Automated Optimization',
    description: 'Get instant recommendations to cut waste and improve efficiency.'
  },
  {
    icon: CheckCircle,
    title: 'Multi-provider Support',
    description: 'Audit OpenAI, Anthropic, Google Cloud, Azure, and more from one dashboard.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 compliant with zero data retention and encrypted audit logs.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
}

export default function Features() {
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
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">FEATURES</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for teams who care about efficiency.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div key={i} variants={itemVariants} className="flex gap-4">
                <div className="flex-shrink-0">
                  <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
