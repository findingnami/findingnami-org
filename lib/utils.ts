export function cn(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes.filter(Boolean).join(" ");
}

// Formats a UTC date string for display in Philippine Time (UTC+8).
// Output: "Sat, Jun 14 · 2:00 PM PHT"
export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  const datePart = date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const timePart = date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${datePart} · ${timePart} PHT`
}

// Time-only display in PHT: "2:00 PM"
export function formatEventTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Treats a datetime-local input value (YYYY-MM-DDTHH:MM) as PHT and returns UTC ISO.
export function phtToISO(localDateTimeStr: string): string {
  return new Date(localDateTimeStr + ':00+08:00').toISOString()
}

// Returns the next full hour in PHT formatted for a datetime-local input.
export function nextFullHourPHT(): string {
  const nowUtc = new Date()
  const phtMs = nowUtc.getTime() + 8 * 60 * 60 * 1000
  const phtNow = new Date(phtMs)
  phtNow.setUTCMinutes(0, 0, 0)
  const next = new Date(phtNow.getTime() + 60 * 60 * 1000)
  const y = next.getUTCFullYear()
  const mo = String(next.getUTCMonth() + 1).padStart(2, '0')
  const d = String(next.getUTCDate()).padStart(2, '0')
  const h = String(next.getUTCHours()).padStart(2, '0')
  return `${y}-${mo}-${d}T${h}:00`
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
