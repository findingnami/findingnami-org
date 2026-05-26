'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AccountTab({ email }: { email: string }) {
  const [signingOut, setSigningOut] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-8">
      {/* Account info */}
      <div>
        <h3 className="text-sm font-bold text-stone-700 mb-3">Account</h3>
        <div className="bg-stone-50 rounded-2xl px-4 py-3.5 border border-gray-100">
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">
            Email address
          </p>
          <p className="text-sm text-stone-700">{email}</p>
        </div>
        <p className="text-xs text-stone-400 mt-2">
          To update your email address, contact{' '}
          <a href="mailto:hello@findingnami.com" className="text-brand-orange hover:underline">
            hello@findingnami.com
          </a>
          .
        </p>
      </div>

      {/* Sign out */}
      <div>
        <h3 className="text-sm font-bold text-stone-700 mb-3">Session</h3>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 text-sm font-semibold text-stone-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:border-stone-300 hover:text-stone-800 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      {/* Danger zone */}
      <div>
        <h3 className="text-sm font-bold text-stone-700 mb-3">Danger zone</h3>
        {!showDanger ? (
          <button
            type="button"
            onClick={() => setShowDanger(true)}
            className="text-sm text-red-500 font-semibold hover:underline"
          >
            Delete my account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-red-700 mb-2">Delete account</p>
            <p className="text-sm text-red-600 leading-relaxed mb-4">
              We&apos;re sorry to see you go. Account deletion removes all your posts, RSVPs, and
              profile data permanently. This cannot be undone.
            </p>
            <p className="text-sm text-stone-600">
              To delete your account, email us at{' '}
              <a
                href="mailto:hello@findingnami.com?subject=Account deletion request"
                className="text-brand-orange font-semibold hover:underline"
              >
                hello@findingnami.com
              </a>{' '}
              from your registered email address and we&apos;ll process it within 5 business days.
            </p>
            <button
              type="button"
              onClick={() => setShowDanger(false)}
              className="mt-4 text-xs text-stone-400 hover:text-stone-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
