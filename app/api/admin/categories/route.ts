import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

export async function GET() {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('categories')
      .select('*, parent:parent_id(id, name)')
      .order('name')

    if (error) throw error
    return NextResponse.json({ categories: data })
  } catch (error) {
    console.error('Admin GET categories error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const { data, error } = await adminClient
      .from('categories')
      .insert({
        name: body.name,
        slug: body.slug || slug,
        description: body.description || null,
        parent_id: body.parent_id || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Admin POST category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
