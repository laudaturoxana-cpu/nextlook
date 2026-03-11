'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function trackEvent(data: {
  event_type: string
  page_path?: string
  product_id?: string
  product_name?: string
  category_name?: string
}) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {})
}

export { trackEvent }

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string>('')

  useEffect(() => {
    if (pathname === lastPath.current) return
    if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return
    lastPath.current = pathname

    trackEvent({ event_type: 'page_view', page_path: pathname })
  }, [pathname])

  return null
}
