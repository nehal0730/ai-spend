import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How do you access my AI provider accounts?',
    answer: 'We only request read-only API keys. Your credentials are encrypted at rest and in transit. We never store raw credentials or access more than necessary to audit costs.'
  },
  {
    question: 'What providers do you support?',
    answer: 'We currently support OpenAI, Anthropic, Google Cloud, Azure OpenAI, and Cohere. More providers are added monthly.'
  },
  {
    question: 'How often are audits run?',
    answer: 'Audits run automatically on a configurable schedule (daily, weekly, or on-demand). You can also trigger manual audits anytime.'
  },
  {
    question: 'What data do you retain?',
    answer: 'We retain anonymized usage patterns and recommendations only. We never store your actual request content or model outputs.'
  },
  {
    question: 'Can I share reports with my team?',
    answer: 'Yes. Reports are shareable via unlisted public links. You control who sees what data and for how long.'
  },
  {
    question: 'Is there a trial period?',
    answer: 'Yes, we offer a 7-day free trial with full feature access. No credit card required to start.'
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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      variants={itemVariants}
      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{question}</span>
        <ChevronDown
          size={20}
          className={`text-slate-600 dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
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
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Common questions answered.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-4"
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
