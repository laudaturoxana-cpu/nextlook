import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get top-rated approved reviews
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .gte('rating', 4)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      throw error
    }

    // Calculate average rating
    const { data: stats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('is_approved', true)

    let averageRating = 4.8
    let totalReviews = 0

    if (stats && stats.length > 0) {
      totalReviews = stats.length
      averageRating = stats.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      averageRating = Math.round(averageRating * 10) / 10
    }

    return NextResponse.json({
      reviews: reviews || [],
      averageRating,
      totalReviews,
    })
  } catch (error) {
    console.error('Error fetching featured reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
