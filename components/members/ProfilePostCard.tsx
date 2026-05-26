import { timeAgo } from '@/lib/utils'
import type { RecentPost } from '@/types/members'

export function ProfilePostCard({ post }: { post: RecentPost }) {
  return (
    <div className="py-3.5 border-b border-stone-100 last:border-0">
      {post.channel && (
        <span className="text-xs text-brand-orange font-medium">#{post.channel.slug}</span>
      )}
      <p className="text-sm text-stone-700 mt-1 line-clamp-3 leading-relaxed">{post.content}</p>
      <p className="text-xs text-stone-400 mt-1.5">{timeAgo(post.created_at)}</p>
    </div>
  )
}
