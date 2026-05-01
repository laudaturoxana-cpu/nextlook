import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { emagFetch } from '@/lib/emag'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const charId = searchParams.get('id') || '6506'

  // eMAG characteristics come from category/read, not a separate endpoint
  const result = await emagFetch('category/read', {
    id: parseInt(charId),
  })

  return NextResponse.json(result)
}
