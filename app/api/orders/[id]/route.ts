import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = createAdminClient()
    const { id } = params

    // Fetch order using admin client to bypass RLS (needed for guest orders)
    const { data: order, error } = await adminSupabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Transform data to match expected format
    // The database uses shipping_address as JSONB, so we need to extract the fields
    const shippingAddress = order.shipping_address as {
      full_name?: string
      address?: string
      city?: string
      county?: string
      postal_code?: string
      delivery_method?: string
      order_number?: string
      awb_number?: string
      dpd_shipment_id?: number
    } | null

    const transformedOrder = {
      ...order,
      // Map guest fields to expected names
      email: order.guest_email,
      phone: order.guest_phone,
      // Extract shipping details from JSONB
      order_number: shippingAddress?.order_number || order.id.slice(0, 8).toUpperCase(),
      shipping_name: shippingAddress?.full_name || '',
      shipping_address: shippingAddress?.address || '',
      shipping_city: shippingAddress?.city || '',
      shipping_county: shippingAddress?.county || '',
      shipping_postal_code: shippingAddress?.postal_code || '',
      delivery_method: shippingAddress?.delivery_method || 'curier_rapid',
      awb_number: shippingAddress?.awb_number || null,
      dpd_shipment_id: shippingAddress?.dpd_shipment_id || null,
      // Transform order items to add subtotal
      order_items: order.order_items?.map((item: any) => ({
        ...item,
        subtotal: item.price * item.quantity,
      })),
    }

    return NextResponse.json({ order: transformedOrder })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update order
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: body.status,
        payment_status: body.payment_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
