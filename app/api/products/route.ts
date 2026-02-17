import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const brands = searchParams.get('brands')?.split(',')
    const sizes = searchParams.get('sizes')?.split(',')
    const sortBy = searchParams.get('sort') || 'relevance'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const isBestseller = searchParams.get('is_bestseller')
    const isFeatured = searchParams.get('is_featured')
    const isNew = searchParams.get('is_new')

    let query = supabase.from('products').select('*', { count: 'exact' })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (isBestseller === 'true') {
      query = query.eq('is_bestseller', true)
    }

    if (isFeatured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (isNew === 'true') {
      query = query.eq('is_new', true)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (brands && brands.length > 0) {
      query = query.in('brand', brands)
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'bestseller':
        query = query.order('is_bestseller', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      products: data,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Check if user is admin (you would implement proper admin check)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
