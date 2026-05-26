'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'

export type Notification = Tables<'notifications'>

export async function getRecentNotifications(): Promise<{
  notifications: Notification[]
  unreadCount: number
}> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { notifications: [], unreadCount: 0 }

  const [{ data: notifications }, { count }] = await Promise.all([
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false),
  ])

  return { notifications: notifications ?? [], unreadCount: count ?? 0 }
}

export async function getAllNotifications(): Promise<Notification[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return data ?? []
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  revalidatePath('/notifications')
}

export async function markAllRead(): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  revalidatePath('/notifications')
}
