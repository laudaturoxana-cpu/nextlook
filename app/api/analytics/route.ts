import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, page_path, product_id, product_name, category_name } = body

    if (!event_type) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createAdminClient()
    await supabase.from('analytics_events').insert({
      event_type,
      page_path: page_path || null,
      product_id: product_id || null,
      product_name: product_name || null,
      category_name: category_name || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Fail silently — nu vrem să stricăm experiența utilizatorului
    return NextResponse.json({ ok: true })
  }
}
