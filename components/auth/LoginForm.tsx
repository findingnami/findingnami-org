'use client'

import { useState } from 'react'
import { signInWithMagicLink, signInWithGoogle } from '@/lib/actions/auth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isGooglePending, setIsGooglePending] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email || isPending) return
    setError(null)
    setIsPending(true)
    try {
      const result = await signInWithMagicLink(email)
      if (result?.error) {
        setError(result.error)
      } else {
        setSent(true)
      }
    } finally {
      setIsPending(false)
    }
  }

  async function handleGoogle() {
    if (isGooglePending) return
    setError(null)
    setIsGooglePending(true)
    try {
      const result = await signInWithGoogle()
      if (result?.error) {
        setError(result.error)
        setIsGooglePending(false)
      }
      // On success, signInWithGoogle calls redirect() server-side and the browser navigates away
    } catch {
      setIsGooglePending(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailIcon />
        </div>
        <h2 className="text-lg font-bold text-stone-900 mb-2">Check your inbox</h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          We sent a sign-in link to <span className="font-semibold text-stone-700">{email}</span>.
          It expires in 1 hour.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="mt-5 text-sm text-brand-orange hover:underline font-medium"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-rose-500 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange/90 disabled:opacity-60 transition flex items-center justify-center gap-2 text-sm"
        >
          {isPending ? (
            <>
              <Spinner className="text-white/60 border-t-white" />
              Sending link...
            </>
          ) : (
            'Send magic link'
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-xs text-stone-400 font-medium">or</span>
        <div className="flex-1 h-px bg-stone-100" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={isGooglePending}
        className="w-full py-2.5 px-4 border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 disabled:opacity-60 transition flex items-center justify-center gap-2 text-sm"
      >
        {isGooglePending ? (
          <>
            <Spinner className="text-stone-300 border-t-stone-500" />
            Redirecting...
          </>
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </button>

      <p className="mt-6 text-center text-xs text-stone-400 leading-relaxed">
        New here? No need to sign up separately — entering your email gets you in.
      </p>
    </div>
  )
}

function Spinner({ className }: { className: string }) {
  return (
    <span
      className={`h-4 w-4 border-2 rounded-full animate-spin flex-shrink-0 ${className}`}
    />
  )
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand-orange"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.233 17.64 11.925 17.64 9.2Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}
