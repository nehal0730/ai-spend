import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How do you access my AI accounts?',
    answer:
      'We use read-only API keys that you provide. You control access permissions, can revoke at any time, and we never store credentials.'
  },
  {
    question: 'Which AI providers do you support?',
    answer:
      'We support OpenAI, Anthropic, Google Cloud, Azure OpenAI, Cohere, Replicate, and more. New providers added every month.'
  },
  {
    question: 'How often should I run audits?',
    answer:
      'We recommend weekly audits to catch spending anomalies early. Set up automated audits to run on your schedule.'
  },
  {
    question: 'Is my data retained after the audit?',
    answer:
      'No. We analyze your usage in real-time and delete all data immediately after the audit completes. SOC2 compliant.'
  },
  {
    question: 'Can I share reports with my team?',
    answer:
      'Yes. Generate shareable links with customizable permissions. Stakeholders can view reports without creating an account.'
  },
  {
    question: 'What happens after the free trial?',
    answer:
      'Upgrade to a paid plan for unlimited audits and priority support. Cancel anytime—no lock-in contracts.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      className="border-b border-slate-200 dark:border-slate-700 last:border-b-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 md:py-7 px-4 md:px-6 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-left group"
      >
        <span className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {question}
        </span>
        <ChevronDown
          size={24}
          className={`flex-shrink-0 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-6 md:pb-8 text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
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
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest">FAQ</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight">
            Common questions answered.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">Everything you need to know about AI Spend</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm"
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
