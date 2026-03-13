import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createDPDShipment, getDPDLabel } from '@/lib/dpd'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Fetch the order to get shipping details for AWB generation
          const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

          let awbNumber: string | null = null
          let dpdShipmentId: number | null = null
          let awbPdfUrl: string | null = null
          const addr = order?.shipping_address as Record<string, string> | null

          // Only generate AWB if courier delivery and no AWB yet
          const deliveryMethod = addr?.delivery_method || ''
          const existingAwb = addr?.awb_number || null

          if (
            order &&
            (deliveryMethod === 'curier_rapid' || deliveryMethod === 'curier_gratuit') &&
            !existingAwb
          ) {
            try {
              const orderNumber = addr?.order_number || orderId.slice(0, 8).toUpperCase()
              const dpdResult = await createDPDShipment({
                recipientName: addr?.full_name || '',
                recipientPhone: order.guest_phone || '',
                recipientCity: addr?.city || '',
                recipientAddress: addr?.address || '',
                recipientPostCode: addr?.postal_code,
                total: order.total,
                paymentMethod: 'card',
                orderNumber,
                parcelsCount: 1,
              })

              awbNumber = dpdResult.awbNumber
              dpdShipmentId = dpdResult.shipmentId

              // Download and save PDF immediately
              try {
                const pdfBuffer = await getDPDLabel(dpdResult.parcelIds)
                if (pdfBuffer && pdfBuffer.length > 0) {
                  const pdfPath = `awb/${orderNumber}-${awbNumber}.pdf`
                  const { error: uploadErr } = await supabase.storage
                    .from('product-images')
                    .upload(pdfPath, new Uint8Array(pdfBuffer), { contentType: 'application/pdf', upsert: true })
                  if (!uploadErr) {
                    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(pdfPath)
                    awbPdfUrl = publicUrl
                  }
                }
              } catch (pdfErr) {
                console.error('AWB PDF save error (non-fatal):', pdfErr)
              }

              console.log(`DPD AWB generated for card order ${orderId}: ${awbNumber}`)
            } catch (dpdError: any) {
              console.error('DPD shipment error in webhook (non-fatal):', dpdError?.message)
            }
          }

          // Update order payment status + AWB if generated
          const updateData: Record<string, unknown> = {
            payment_status: 'paid',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          }

          if (awbNumber && addr) {
            updateData.shipping_address = {
              ...addr,
              awb_number: awbNumber,
              dpd_shipment_id: dpdShipmentId,
              awb_pdf_url: awbPdfUrl,
            }
          }

          await supabase.from('orders').update(updateData).eq('id', orderId)

          console.log(`Payment succeeded for order ${orderId}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Update order payment status
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

          console.log(`Payment failed for order ${orderId}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
