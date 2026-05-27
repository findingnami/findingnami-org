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

  redirect('/login')
}
