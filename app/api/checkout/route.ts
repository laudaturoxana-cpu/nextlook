import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { generateOrderNumber } from '@/lib/utils'
import { createDPDShipment } from '@/lib/dpd'

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
        subtotal,
        shipping_cost: shippingCost,
        total,
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
          total,
          paymentMethod,
          orderNumber,
          parcelsCount: items.length || 1,
        })

        awbNumber = dpdResult.awbNumber
        dpdShipmentId = dpdResult.shipmentId

        // Save AWB to order's shipping_address JSONB
        await adminSupabase
          .from('orders')
          .update({
            shipping_address: {
              ...shippingAddress,
              awb_number: awbNumber,
              dpd_shipment_id: dpdShipmentId,
            },
            status: 'confirmed',
          })
          .eq('id', order.id)

        console.log(`DPD AWB generated: ${awbNumber} for order ${orderNumber}`)
      } catch (dpdError: any) {
        // Log DPD error but don't fail the order
        console.error('DPD shipment error (order still created):', dpdError?.message)
      }
    }

    // If payment is by card, create Stripe PaymentIntent
    if (paymentMethod === 'card') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
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
      })
    }

    // For ramburs or pickup, return success with AWB if generated
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
