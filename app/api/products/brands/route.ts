import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get distinct brands from products
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .not('brand', 'is', null)
      .order('brand')

    if (error) {
      throw error
    }

    // Extract unique brands
    const brandsArray = data?.map(p => p.brand).filter(Boolean) || []
    const uniqueBrands = Array.from(new Set(brandsArray))

    return NextResponse.json({ brands: uniqueBrands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}
