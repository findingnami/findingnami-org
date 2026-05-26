import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchPostsWithMeta } from '@/lib/actions/posts'
import { RealtimeFeed } from '@/components/feed/RealtimeFeed'

export const metadata = { title: 'Feed — Finding Nami' }

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: { channel?: string; author?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const channelSlug = searchParams?.channel ?? null
  const authorId = searchParams?.author ?? null

  // Resolve channel slug → ID
  let channelId: string | null = null
  let activeChannel: { id: string; slug: string; name: string } | null = null
  if (channelSlug) {
    const { data } = await supabase
      .from('channels')
      .select('id, slug, name')
      .eq('slug', channelSlug)
      .single()
    activeChannel = data
    channelId = data?.id ?? null
  }

  // Fetch current user's profile (for PostComposer)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, username')
    .eq('id', user.id)
    .single()

  // Fetch channels (for PostComposer dropdown)
  const { data: channels } = await supabase
    .from('channels')
    .select('id, slug, name')
    .eq('is_public', true)
    .order('name')

  // Fetch initial posts
  const initialPosts = await fetchPostsWithMeta(supabase, user.id, { channelId, authorId })

  // ── Right sidebar data ──

  // Upcoming events (next 2)
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('id, title, starts_at')
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(2)

  // Channel post counts (top-level posts only)
  const channelList = channels ?? []
  const channelIds = channelList.map((c) => c.id)
  const { data: channelPostRows } = await supabase
    .from('posts')
    .select('channel_id')
    .is('parent_id', null)
    .in('channel_id', channelIds)

  const postCountByChannel = new Map<string, number>()
  channelPostRows?.forEach((r) => {
    postCountByChannel.set(r.channel_id!, (postCountByChannel.get(r.channel_id!) ?? 0) + 1)
  })

  // 3 newest members
  const { data: newMembers } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, username')
    .order('created_at', { ascending: false })
    .limit(3)

  const userProfile = profile ?? {
    id: user.id,
    full_name: '',
    avatar_url: null,
    username: '',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* ── Main feed column ── */}
        <div className="flex-1 min-w-0">
          {activeChannel && (
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-lg font-bold text-stone-800">#{activeChannel.slug}</h1>
              <span className="text-stone-400 text-sm">·</span>
              <Link href="/feed" className="text-sm text-stone-400 hover:text-brand-orange transition-colors">
                All channels
              </Link>
            </div>
          )}

          <RealtimeFeed
            initialPosts={initialPosts}
            channelId={channelId}
            channelSlug={channelSlug}
            authorId={authorId}
            channels={channelList}
            userProfile={userProfile}
          />
        </div>

        {/* ── Right sidebar ── */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-4">
          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-bold text-stone-700 mb-3">Upcoming Events</h2>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href="/events"
                    className="block hover:bg-stone-50 rounded-lg p-2 -mx-2 transition-colors"
                  >
                    <p className="text-sm font-medium text-stone-800 leading-snug">
                      {event.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(event.starts_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400">No upcoming events yet.</p>
            )}
            <Link
              href="/events"
              className="block mt-3 text-xs text-brand-orange font-semibold hover:underline"
            >
              View all events →
            </Link>
          </div>

          {/* Active channels */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-bold text-stone-700 mb-3">Channels</h2>
            <div className="space-y-1">
              {channelList.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/feed?channel=${ch.slug}`}
                  className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-stone-50 transition-colors group"
                >
                  <span className="text-sm text-stone-600 group-hover:text-stone-900">
                    #{ch.slug}
                  </span>
                  {(postCountByChannel.get(ch.id) ?? 0) > 0 && (
                    <span className="text-xs bg-stone-100 text-stone-500 rounded-full px-2 py-0.5">
                      {postCountByChannel.get(ch.id)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* New members */}
          {newMembers && newMembers.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-stone-700 mb-3">New Members</h2>
              <div className="space-y-3">
                {newMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.id}`}
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                  >
                    {member.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <MiniInitialsAvatar name={member.full_name} />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-stone-400 truncate">@{member.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/members"
                className="block mt-3 text-xs text-brand-orange font-semibold hover:underline"
              >
                See all members →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function MiniInitialsAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
      <span className="text-brand-orange font-bold text-xs">{initials}</span>
    </div>
  )
}
