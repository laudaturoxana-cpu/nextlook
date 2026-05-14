import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { syncProductToEmag, emagFetch } from '@/lib/emag'

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
      emagSellerId = Math.floor(Date.now() / 1000) % 1600000 + Math.floor(Math.random() * 1000)
    }

    // If previously synced and has sizes, deactivate the old single offer
    // (old code sent one offer for all sizes; new code sends one per size)
    if (product.emag_seller_id && product.sizes?.length > 0) {
      await emagFetch('product_offer/save', {
        data: [{ id: product.emag_seller_id, status: 0 }],
      }).catch(() => {}) // ignore if old offer doesn't exist
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
      sizeStocks: product.size_stocks || {},
    })

    // Check top-level error and all item-level errors
    const allResults: any[] = result?.results || []
    const failedResults = allResults.filter((r: any) => r?.isError)
    const hasError = result?.isError || failedResults.length > 0

    if (hasError) {
      await adminSupabase
        .from('products')
        .update({
          emag_seller_id: emagSellerId,
          emag_category_id: emagCategoryId,
          emag_sync_status: 'error',
        })
        .eq('id', productId)

      const messages = failedResults.flatMap((r: any) => r?.messages || [])
        .concat(result?.messages || [])
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
