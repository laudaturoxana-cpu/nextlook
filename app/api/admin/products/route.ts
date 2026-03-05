import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('products')
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ products: data })
  } catch (error) {
    console.error('Admin GET products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
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

    const { data, error } = await adminClient
      .from('products')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: parseFloat(body.price),
        original_price: body.original_price ? parseFloat(body.original_price) : null,
        category_id: body.category_id || null,
        brand: body.brand || null,
        stock_quantity: parseInt(body.stock_quantity) || 0,
        sizes: body.sizes || [],
        colors: body.colors || [],
        images: body.images || [],
        is_featured: body.is_featured || false,
        is_new: body.is_new || false,
        is_on_sale: body.is_on_sale || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Admin POST product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
