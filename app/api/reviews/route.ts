import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('reviews')
      .select('*, users(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (productId) {
      query = query.eq('product_id', productId)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      reviews: data,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to leave a review' },
        { status: 401 }
      )
    }

    const { productId, orderId, rating, title, comment } = body

    // Verify user has purchased this product (optional)
    let verifiedPurchase = false
    if (orderId) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id)')
        .eq('product_id', productId)
        .eq('orders.user_id', user.id)
        .single()

      verifiedPurchase = !!orderItem
    }

    // Create review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: orderId || null,
        rating,
        title,
        comment,
        verified_purchase: verifiedPurchase,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update product rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    if (reviews && reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

      await supabase
        .from('products')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          reviews_count: reviews.length,
        })
        .eq('id', productId)
    }

    return NextResponse.json({ review: data })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
