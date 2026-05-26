'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type OnboardingData = {
  full_name: string
  avatar_url?: string | null
  industry: string
  career_stage: 'early' | 'mid' | 'senior' | 'exec'
  current_work_setup: 'on-site' | 'hybrid' | 'remote' | 'freelance'
  remote_goal: 'negotiating-wfh' | 'job-hunting' | 'freelancing' | 'already-remote'
  bio?: string | null
}

export async function completeOnboarding(data: OnboardingData): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      avatar_url: data.avatar_url ?? null,
      industry: data.industry,
      career_stage: data.career_stage,
      current_work_setup: data.current_work_setup,
      remote_goal: data.remote_goal,
      bio: data.bio ?? null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  redirect('/feed')
}
