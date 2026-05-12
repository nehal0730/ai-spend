import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

type Props = {
  title: string
  message: string
  onClose: () => void
  open: boolean
}

export default function SuccessToast({ title, message, onClose, open }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-[70] w-[min(92vw,380px)] rounded-[1.4rem] border border-emerald-400/20 bg-slate-950/95 p-4 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-400/15 p-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{message}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white" aria-label="Dismiss notification">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
