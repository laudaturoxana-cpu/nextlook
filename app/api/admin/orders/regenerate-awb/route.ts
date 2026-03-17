import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createDPDShipment, getDPDLabel } from '@/lib/dpd'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'orderId lipsă' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Comanda nu a fost găsită' }, { status: 404 })
    }

    const addr = order.shipping_address as Record<string, string> | null
    if (!addr) {
      return NextResponse.json({ error: 'Adresa de livrare lipsă' }, { status: 400 })
    }

    const orderNumber = addr.order_number || order.id.slice(0, 8).toUpperCase()

    const dpdResult = await createDPDShipment({
      recipientName: addr.full_name || '',
      recipientPhone: order.guest_phone || '',
      recipientCity: addr.city || '',
      recipientAddress: addr.address || '',
      recipientPostCode: addr.postal_code,
      total: order.total,
      paymentMethod: order.payment_method || 'card',
      orderNumber,
      parcelsCount: 1,
    })

    const awbNumber = dpdResult.awbNumber
    const dpdShipmentId = dpdResult.shipmentId

    // Download and save PDF
    let awbPdfUrl: string | null = null
    try {
      const pdfBuffer = await getDPDLabel(dpdResult.parcelIds, dpdResult.barcodes)
      if (pdfBuffer && pdfBuffer.length > 0) {
        const pdfPath = `awb/${orderNumber}-${awbNumber}.pdf`
        const { error: uploadErr } = await adminClient.storage
          .from('product-images')
          .upload(pdfPath, new Uint8Array(pdfBuffer), { contentType: 'application/pdf', upsert: true })
        if (!uploadErr) {
          const { data: { publicUrl } } = adminClient.storage.from('product-images').getPublicUrl(pdfPath)
          awbPdfUrl = publicUrl
        }
      }
    } catch (pdfErr) {
      console.error('AWB PDF save error (non-fatal):', pdfErr)
    }

    await adminClient
      .from('orders')
      .update({
        shipping_address: {
          ...addr,
          awb_number: awbNumber,
          dpd_shipment_id: dpdShipmentId,
          awb_pdf_url: awbPdfUrl,
        },
        status: 'confirmed',
      })
      .eq('id', orderId)

    return NextResponse.json({ awbNumber, dpdShipmentId, awbPdfUrl })
  } catch (error: any) {
    console.error('Regenerate AWB error:', error)
    return NextResponse.json({ error: error?.message || 'Eroare la generarea AWB' }, { status: 500 })
  }
}
