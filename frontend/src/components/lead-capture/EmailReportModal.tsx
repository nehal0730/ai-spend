import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import LeadCaptureForm from './LeadCaptureForm'
import type { LeadCaptureMode, LeadCaptureSource } from '../../lib/lead-capture-types'

type Props = {
  open: boolean
  onClose: () => void
  mode: LeadCaptureMode
  source: LeadCaptureSource
  title: string
  description: string
  shareId?: string
  reportTitle?: string
  reportUrl?: string
  submitLabel?: string
  onSuccess?: (message: string) => void
}

export default function EmailReportModal(props: Props) {
  useEffect(() => {
    if (!props.open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        props.onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [props])

  return (
    <AnimatePresence>
      {props.open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-sm sm:items-center"
          onMouseDown={props.onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-50 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.55)] dark:bg-slate-950 sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={props.onClose}
              className="absolute right-4 top-4 rounded-full border border-surface bg-white p-2 text-soft transition-colors hover:bg-slate-50 hover:text-primary dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Close lead capture dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <LeadCaptureForm
              mode={props.mode}
              source={props.source}
              title={props.title}
              description={props.description}
              shareId={props.shareId}
              reportTitle={props.reportTitle}
              reportUrl={props.reportUrl}
              submitLabel={props.submitLabel}
              onSuccess={props.onSuccess}
              onCancel={props.onClose}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
