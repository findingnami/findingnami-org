import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Join Finding Nami',
}

export default async function SignupPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('industry')
      .eq('id', user.id)
      .single()
    redirect(profile?.industry ? '/feed' : '/onboarding')
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
      <span className="text-brand-orange font-extrabold text-2xl tracking-tight">
        Finding Nami
      </span>
      <p className="mt-6 text-stone-800 font-semibold">
        Just enter your email to get started
      </p>
      <p className="mt-2 text-sm text-stone-500 leading-relaxed">
        No password needed. We&apos;ll send you a magic link and you&apos;re in.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-flex w-full items-center justify-center py-2.5 px-4 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange/90 transition text-sm"
      >
        Go to sign in
      </Link>
    </div>
  )
}
