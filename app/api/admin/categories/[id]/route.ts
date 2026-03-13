import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('categories')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        parent_id: body.parent_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Admin PUT category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Check if category has products
    const { count } = await adminClient
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Categoria are ${count} produse. Mută produsele înainte de a șterge categoria.` },
        { status: 400 }
      )
    }

    const { error } = await adminClient
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin DELETE category error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 })
  }
}
