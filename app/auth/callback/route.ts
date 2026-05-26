import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

type CookieItem = { name: string; value: string; options: object }

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Collect cookies during exchangeCodeForSession so we can apply them
  // to the redirect response directly — cookieStore.set() does not carry
  // through to a custom NextResponse, which would leave the browser with
  // no session cookies and cause the middleware to bounce back to /login.
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

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/login`)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const redirectTo = profile?.full_name ? `${origin}/feed` : `${origin}/onboarding`
  const response = NextResponse.redirect(redirectTo)

  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )

  return response
}
