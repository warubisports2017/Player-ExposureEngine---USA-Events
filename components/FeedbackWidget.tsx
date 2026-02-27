import { useState } from 'react'
import { MessageSquarePlus, X } from 'lucide-react'

type FeedbackType = 'Bug' | 'Feature' | 'Other'

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('Bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const reset = () => {
    setType('Bug')
    setMessage('')
    setEmail('')
    setSuccess(false)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(reset, 200)
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          type,
          email: email.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSuccess(true)
      setTimeout(handleClose, 2500)
    } catch (err) {
      console.error('Feedback submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-slate-900 dark:bg-white/10 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer border border-slate-700 dark:border-white/20"
        aria-label="Send feedback"
      >
        <MessageSquarePlus size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[15px] text-slate-900 dark:text-white">
                Send Feedback
              </h3>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">&#10003;</div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Got it! {email.trim() ? "We'll look into this." : 'Thanks for your input.'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {email.trim()
                    ? "We'll email you when there's an update."
                    : ''}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Your feedback helps shape how this tool evolves.
                </p>
              </div>
            ) : (
              <>
                {/* Type pills */}
                <div className="flex gap-2 mb-3">
                  {(['Bug', 'Feature', 'Other'] as FeedbackType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        type === t
                          ? 'bg-slate-900 dark:bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Email */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional - get notified on updates)"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 mb-3"
                />

                {/* Message */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || submitting}
                  className="mt-3 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
