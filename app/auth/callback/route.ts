import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type CookieItem = { name: string; value: string; options: object }

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // token_hash + type are sent by Supabase when PKCE is not in use (e.g. magic
  // link initiated server-side where no code_verifier was stored client-side).
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Collect cookies so we can apply them to the redirect response directly —
  // cookieStore.set() does not carry through to a custom NextResponse, which
  // would leave the browser with no session and cause middleware to bounce back.
  const pendingCookies: CookieItem[] = []

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(c => pendingCookies.push(c))
        },
      },
    }
  )

  let authError: Error | null = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) authError = error
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    })
    if (error) authError = error
  }

  if (authError) return NextResponse.redirect(`${origin}/login`)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  // Use industry to detect whether the user has completed onboarding.
  // full_name is always set by the DB trigger (falls back to username), so it
  // cannot reliably distinguish a brand-new account from a fully onboarded one.
  const { data: profile } = await supabase
    .from('profiles')
    .select('industry')
    .eq('id', user.id)
    .single()

  const redirectTo = profile?.industry ? `${origin}/feed` : `${origin}/onboarding`
  const response = NextResponse.redirect(redirectTo)

  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )

  return response
}
