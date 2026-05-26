'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function getCallbackUrl() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}/auth/callback`
}

export async function signInWithMagicLink(email: string): Promise<{ error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getCallbackUrl(),
    },
  })

  if (error) return { error: error.message }
  return {}
}

export async function signInWithGoogle(): Promise<{ error?: string } | void> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getCallbackUrl(),
    },
  })

  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}

export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
