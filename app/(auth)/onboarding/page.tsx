import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'

export const metadata = {
  title: 'Welcome — Finding Nami',
}

export default async function OnboardingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('industry')
    .eq('id', user.id)
    .single()

  // Already completed onboarding
  if (profile?.industry) redirect('/feed')

  return <OnboardingForm userId={user.id} />
}
