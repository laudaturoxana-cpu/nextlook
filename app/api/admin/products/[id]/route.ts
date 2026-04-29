import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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
      .from('products')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: parseFloat(body.price),
        original_price: body.original_price ? parseFloat(body.original_price) : null,
        category_id: body.category_id || null,
        brand: body.brand || null,
        ...(body.ean !== undefined ? { ean: body.ean || null } : {}),
        stock_quantity: parseInt(body.stock_quantity) || 0,
        sizes: body.sizes || [],
        size_stocks: body.size_stocks || {},
        colors: body.colors || [],
        images: body.images || [],
        is_featured: body.is_featured || false,
        is_new: body.is_new || false,
        is_on_sale: body.is_on_sale || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/admin/products/${id}`)
    revalidatePath('/admin/products')

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Admin PUT product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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

    const { error } = await adminClient
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
