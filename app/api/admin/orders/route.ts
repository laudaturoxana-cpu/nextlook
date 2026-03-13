import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: orders, error } = await adminClient
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const transformed = orders?.map((order: any) => {
      const addr = order.shipping_address as Record<string, string> | null
      return {
        ...order,
        order_number: addr?.order_number || order.id.slice(0, 8).toUpperCase(),
        shipping_name: addr?.full_name || '',
        shipping_address_text: addr?.address || '',
        shipping_city: addr?.city || '',
        shipping_county: addr?.county || '',
        delivery_method: addr?.delivery_method || 'curier_rapid',
        awb_number: addr?.awb_number || null,
        dpd_shipment_id: addr?.dpd_shipment_id || null,
        awb_pdf_url: addr?.awb_pdf_url || null,
      }
    })

    return NextResponse.json({ orders: transformed })
  } catch (error) {
    console.error('Admin GET orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
