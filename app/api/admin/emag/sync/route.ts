import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { syncProductToEmag } from '@/lib/emag'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { productId, emagCategoryId } = await request.json()

    if (!productId || !emagCategoryId) {
      return NextResponse.json({ error: 'productId and emagCategoryId required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Fetch product from DB
    const { data: product, error } = await adminSupabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get or generate eMAG seller ID
    let emagSellerId = product.emag_seller_id
    if (!emagSellerId) {
      // Generate unique integer ID using timestamp + random
      emagSellerId = Math.floor(Date.now() / 1000) % 16000000 + Math.floor(Math.random() * 1000)
    }

    // Build image URLs - only publicly accessible ones
    const images: string[] = (product.images || [])
      .filter((img: string) => img && img.startsWith('http'))
      .slice(0, 9)

    if (images.length === 0) {
      return NextResponse.json({ error: 'Produsul nu are imagini publice' }, { status: 400 })
    }

    // Sync to eMAG
    const result = await syncProductToEmag({
      sellerId: emagSellerId,
      categoryId: emagCategoryId,
      name: product.name,
      partNumber: product.sku || product.slug || `NL-${emagSellerId}`,
      brand: product.brand || 'OEM',
      description: product.description || product.name,
      images,
      price: product.price,
      stock: product.stock_quantity || 0,
      ean: product.ean || null,
      sizes: product.sizes || [],
    })

    // Check both top-level and item-level errors
    const itemResult = result?.results?.[0]
    const hasError = result?.isError || itemResult?.isError

    if (hasError) {
      // Update status as error
      await adminSupabase
        .from('products')
        .update({
          emag_seller_id: emagSellerId,
          emag_category_id: emagCategoryId,
          emag_sync_status: 'error',
        })
        .eq('id', productId)

      const messages = itemResult?.messages || result?.messages || []
      return NextResponse.json({
        success: false,
        emagResponse: { ...result, messages },
      })
    }

    // Save sync status
    await adminSupabase
      .from('products')
      .update({
        emag_seller_id: emagSellerId,
        emag_category_id: emagCategoryId,
        emag_sync_status: 'synced',
        emag_synced_at: new Date().toISOString(),
      })
      .eq('id', productId)

    return NextResponse.json({
      success: true,
      emagSellerId,
      emagResponse: result,
    })
  } catch (error: any) {
    console.error('eMAG sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
