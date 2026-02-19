import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform orders to match expected format
    const transformedOrders = orders?.map((order: any) => {
      const shippingAddress = order.shipping_address as {
        full_name?: string
        address?: string
        city?: string
        county?: string
        postal_code?: string
        delivery_method?: string
        order_number?: string
      } | null

      return {
        ...order,
        email: order.guest_email,
        phone: order.guest_phone,
        order_number: shippingAddress?.order_number || order.id.slice(0, 8).toUpperCase(),
        shipping_name: shippingAddress?.full_name || '',
        shipping_address: shippingAddress?.address || '',
        shipping_city: shippingAddress?.city || '',
        shipping_county: shippingAddress?.county || '',
        shipping_postal_code: shippingAddress?.postal_code || '',
        delivery_method: shippingAddress?.delivery_method || 'curier_rapid',
        order_items: order.order_items?.map((item: any) => ({
          ...item,
          subtotal: item.price * item.quantity,
        })),
      }
    })

    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
