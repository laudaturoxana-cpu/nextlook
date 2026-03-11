'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, ShoppingBag, Tag, Users } from 'lucide-react'

interface AnalyticsEvent {
  id: number
  event_type: string
  page_path: string | null
  product_id: string | null
  product_name: string | null
  category_name: string | null
  created_at: string
}

function eventLabel(ev: AnalyticsEvent) {
  switch (ev.event_type) {
    case 'page_view':
      return `Vizualizare pagină: ${ev.page_path}`
    case 'product_view':
      return `Produs văzut: ${ev.product_name}`
    case 'category_view':
      return `Categorie: ${ev.category_name}`
    case 'add_to_cart':
      return `Adăugat în coș: ${ev.product_name}`
    default:
      return ev.event_type
  }
}

function eventIcon(type: string) {
  switch (type) {
    case 'product_view': return <Eye className="h-4 w-4 text-blue-400" />
    case 'category_view': return <Tag className="h-4 w-4 text-purple-400" />
    case 'add_to_cart': return <ShoppingBag className="h-4 w-4 text-green-400" />
    default: return <Users className="h-4 w-4 text-gray-400" />
  }
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `acum ${diff}s`
  if (diff < 3600) return `acum ${Math.floor(diff / 60)}m`
  return `acum ${Math.floor(diff / 3600)}h`
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [stats, setStats] = useState({ page_views: 0, product_views: 0, category_views: 0, add_to_cart: 0 })

  useEffect(() => {
    const supabase = createClient()

    // Load last 50 events
    supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setEvents(data)
      })

    // Load today's stats
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    supabase
      .from('analytics_events')
      .select('event_type')
      .gte('created_at', todayStart.toISOString())
      .then(({ data }) => {
        if (!data) return
        const s = { page_views: 0, product_views: 0, category_views: 0, add_to_cart: 0 }
        data.forEach(ev => {
          if (ev.event_type === 'page_view') s.page_views++
          else if (ev.event_type === 'product_view') s.product_views++
          else if (ev.event_type === 'category_view') s.category_views++
          else if (ev.event_type === 'add_to_cart') s.add_to_cart++
        })
        setStats(s)
      })

    // Realtime subscription
    const channel = supabase
      .channel('analytics_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'analytics_events' },
        (payload) => {
          const newEv = payload.new as AnalyticsEvent
          setEvents(prev => [newEv, ...prev].slice(0, 50))
          setStats(prev => ({
            ...prev,
            page_views: prev.page_views + (newEv.event_type === 'page_view' ? 1 : 0),
            product_views: prev.product_views + (newEv.event_type === 'product_view' ? 1 : 0),
            category_views: prev.category_views + (newEv.event_type === 'category_view' ? 1 : 0),
            add_to_cart: prev.add_to_cart + (newEv.event_type === 'add_to_cart' ? 1 : 0),
          }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics în timp real</h1>

      {/* Stats today */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Vizite azi', value: stats.page_views, icon: <Users className="h-5 w-5 text-gray-400" /> },
          { label: 'Produse vizualizate', value: stats.product_views, icon: <Eye className="h-5 w-5 text-blue-400" /> },
          { label: 'Categorii vizitate', value: stats.category_views, icon: <Tag className="h-5 w-5 text-purple-400" /> },
          { label: 'Adăugări în coș', value: stats.add_to_cart, icon: <ShoppingBag className="h-5 w-5 text-green-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{label}</p>
              {icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">azi</p>
          </div>
        ))}
      </div>

      {/* Live feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h2 className="font-semibold text-gray-800">Activitate în timp real</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {events.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">Nu există activitate recentă.</p>
          )}
          {events.map(ev => (
            <div key={ev.id} className="flex items-center gap-4 px-6 py-3">
              <div className="flex-shrink-0">{eventIcon(ev.event_type)}</div>
              <p className="flex-1 text-sm text-gray-700">{eventLabel(ev)}</p>
              <span className="text-xs text-gray-400 shrink-0">{timeAgo(ev.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
