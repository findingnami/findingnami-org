import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllNotifications } from '@/lib/actions/notifications'
import { NotificationsList } from '@/components/notifications/NotificationsList'

export const metadata = { title: 'Notifications — Finding Nami' }

export default async function NotificationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const notifications = await getAllNotifications()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-stone-900 mb-6">Notifications</h1>
      <NotificationsList initialNotifications={notifications} />
    </div>
  )
}
