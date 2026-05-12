import { useEffect } from 'react'
import Layout from '../components/Layout'
import LeadCaptureForm from '../components/lead-capture/LeadCaptureForm'

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Have questions or want to discuss your AI spend optimization? We'd love to hear from you.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Start the conversation</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Share your email and a short note. We will send a follow-up with practical next steps and recommendations.
              </p>
            </div>

            <LeadCaptureForm
              mode="contact"
              source="landing_page"
              title="Start the conversation"
              description="Share your email and a short note. We will send a follow-up with practical next steps."
              submitLabel="Send my message"
            />

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-4">Other ways to reach us</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>Email: support@aispend.com</p>
                <p>Response time: Usually within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
