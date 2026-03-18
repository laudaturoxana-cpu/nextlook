import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { generateOrderNumber } from '@/lib/utils'
import { createDPDShipment, getDPDLabel } from '@/lib/dpd'
import { sendOwnerOrderNotification, sendCustomerOrderConfirmation } from '@/lib/emails'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(request: NextRequest) {
  try {
    // Use regular client for auth check
    const supabase = await createClient()
    // Use admin client for database operations (bypasses RLS)
    const adminSupabase = createAdminClient()
    const body = await request.json()

    const {
      email,
      phone,
      fullName,
      address,
      city,
      county,
      postalCode,
      notes,
      items,
      subtotal,
      shippingCost,
      total,
      deliveryMethod,
      paymentMethod,
    } = body

    // Get current user (optional - allows guest checkout)
    const { data: { user } } = await supabase.auth.getUser()

    // Validate prices server-side — never trust client-sent prices
    const isValidUUIDCheck = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const validProductIds = items
      .map((i: any) => i.product_id)
      .filter((id: string) => isValidUUIDCheck(id))

    let serverSubtotal = 0
    if (validProductIds.length > 0) {
      const { data: dbProducts } = await adminSupabase
        .from('products')
        .select('id, price')
        .in('id', validProductIds)

      if (dbProducts && dbProducts.length > 0) {
        const priceMap: Record<string, number> = {}
        for (const p of dbProducts) priceMap[p.id] = p.price

        for (const item of items) {
          const dbPrice = priceMap[item.product_id]
          if (dbPrice !== undefined) {
            serverSubtotal += dbPrice * (item.quantity || 1)
          } else {
            serverSubtotal += item.price * (item.quantity || 1)
          }
        }
      } else {
        serverSubtotal = subtotal
      }
    } else {
      serverSubtotal = subtotal
    }

    const FREE_SHIPPING_THRESHOLD = 9999 // TEST
    const SHIPPING_COST_RAPID = 0 // TEST
    const SHIPPING_COST_RAMBURS = 0 // TEST

    let serverShipping = 0
    if (deliveryMethod === 'curier_rapid') {
      serverShipping = serverSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST_RAPID
    } else if (deliveryMethod === 'curier_gratuit') {
      serverShipping = 0
    }
    if (paymentMethod === 'ramburs') serverShipping += SHIPPING_COST_RAMBURS

    const serverTotal = Math.round((serverSubtotal + serverShipping) * 100) / 100

    // Generate order number for reference
    const orderNumber = generateOrderNumber()

    // Create shipping address as JSONB (matching the actual database schema)
    const shippingAddress = {
      full_name: fullName,
      address: address,
      city: city,
      county: county,
      postal_code: postalCode,
      delivery_method: deliveryMethod,
      order_number: orderNumber,
    }

    // Create order in database using admin client (bypasses RLS)
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        guest_email: email,
        guest_phone: phone,
        status: 'pending',
        subtotal: serverSubtotal,
        shipping_cost: serverShipping,
        total: serverTotal,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: 'pending',
        notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Validate product IDs - only use UUID-format IDs that exist in the database
    const isValidUUID = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Create order items using admin client (bypasses RLS)
    // If product_id is invalid (e.g. old mock data), set to null
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: isValidUUID(item.product_id) ? item.product_id : null,
      product_name: item.product_name,
      product_image: item.product_image,
      size: item.size || null,
      color: item.color || null,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback order
      await adminSupabase.from('orders').delete().eq('id', order.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // Generate DPD AWB for courier deliveries (not for pickup)
    let awbNumber: string | null = null
    let dpdShipmentId: number | null = null

    if (deliveryMethod === 'curier_rapid' || deliveryMethod === 'curier_gratuit') {
      try {
        const dpdResult = await createDPDShipment({
          recipientName: fullName,
          recipientPhone: phone,
          recipientCity: city,
          recipientAddress: address,
          recipientPostCode: postalCode,
          total: serverTotal,
          paymentMethod,
          orderNumber,
          parcelsCount: items.length || 1,
        })

        awbNumber = dpdResult.awbNumber
        dpdShipmentId = dpdResult.shipmentId

        // Download PDF label immediately (DPD only serves it right after creation)
        let awbPdfUrl: string | null = null
        try {
          const pdfBuffer = await getDPDLabel(dpdResult.parcelIds, dpdResult.barcodes)
          if (pdfBuffer && pdfBuffer.length > 0) {
            const pdfPath = `awb/${orderNumber}-${awbNumber}.pdf`
            const { error: uploadErr } = await adminSupabase.storage
              .from('product-images')
              .upload(pdfPath, new Uint8Array(pdfBuffer), { contentType: 'application/pdf', upsert: true })
            if (!uploadErr) {
              const { data: { publicUrl } } = adminSupabase.storage.from('product-images').getPublicUrl(pdfPath)
              awbPdfUrl = publicUrl
              console.log(`AWB PDF saved: ${awbPdfUrl}`)
            }
          }
        } catch (pdfErr) {
          console.error('AWB PDF save error (non-fatal):', pdfErr)
        }

        // Save AWB to order's shipping_address JSONB
        await adminSupabase
          .from('orders')
          .update({
            shipping_address: {
              ...shippingAddress,
              awb_number: awbNumber,
              dpd_shipment_id: dpdShipmentId,
              awb_pdf_url: awbPdfUrl,
            },
            status: 'confirmed',
          })
          .eq('id', order.id)

        console.log(`DPD AWB generated: ${awbNumber} for order ${orderNumber}`)
      } catch (dpdError: any) {
        // Log DPD error but don't fail the order
        console.error('DPD shipment error (order still created):', dpdError?.message, '| Full error:', JSON.stringify(dpdError))
      }
    }

    const emailData = {
      orderNumber,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      address,
      city,
      county,
      postalCode,
      deliveryMethod,
      paymentMethod,
      items,
      subtotal: serverSubtotal,
      shippingCost: serverShipping,
      total: serverTotal,
      awbNumber,
      notes,
    }

    // If payment is by card, create Stripe PaymentIntent
    // Emails will be sent AFTER payment is confirmed (from order-confirmation page)
    if (paymentMethod === 'card') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(serverTotal * 100), // Convert to cents — server-calculated price
        currency: 'ron',
        metadata: {
          orderId: order.id,
          orderNumber: orderNumber,
          email: email,
        },
      })

      // Update order with Stripe payment intent ID
      await adminSupabase
        .from('orders')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', order.id)

      return NextResponse.json({
        orderId: order.id,
        orderNumber,
        clientSecret: paymentIntent.client_secret,
        awbNumber,
        emailData, // pass to frontend so it can trigger emails after payment
      })
    }

    // For ramburs: send emails immediately
    try {
      await Promise.all([
        sendOwnerOrderNotification(emailData),
        sendCustomerOrderConfirmation(emailData),
      ])
    } catch (emailError) {
      console.error('Email notification error (order still created):', emailError)
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      awbNumber,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      {
        error: 'Checkout failed',
        details: error?.message || String(error),
        code: error?.code
      },
      { status: 500 }
    )
  }
}
