'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type UpdateProfileData = {
  full_name: string
  bio: string | null
  industry: string | null
  career_stage: 'early' | 'mid' | 'senior' | 'exec' | null
  current_work_setup: 'on-site' | 'hybrid' | 'remote' | 'freelance' | null
  remote_goal:
    | 'negotiating-wfh'
    | 'exploring'
    | 'job-hunting'
    | 'freelancing'
    | 'already-remote'
    | null
  linkedin_url: string | null
  avatar_url: string | null
}

export async function updateProfile(data: UpdateProfileData): Promise<{ error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name.trim(),
      bio: data.bio?.trim() || null,
      industry: data.industry || null,
      career_stage: data.career_stage,
      current_work_setup: data.current_work_setup,
      remote_goal: data.remote_goal,
      linkedin_url: data.linkedin_url?.trim() || null,
      avatar_url: data.avatar_url,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/profile/${user.id}`)
  revalidatePath('/members')
  return {}
}

export async function getChannelFollows(): Promise<string[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('channel_follows')
    .select('channel_id')
    .eq('user_id', user.id)

  return (data ?? []).map((r) => r.channel_id)
}

export async function toggleChannelFollow(channelId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('channel_follows')
    .select('channel_id')
    .eq('channel_id', channelId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('channel_follows')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
  } else {
    await supabase.from('channel_follows').insert({ channel_id: channelId, user_id: user.id })
  }

  revalidatePath('/settings')
  return {}
}
