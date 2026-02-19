import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { generateOrderNumber } from '@/lib/utils'

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

    // Create order items using admin client (bypasses RLS)
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
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
      })
    }

    // For cash on delivery (ramburs), just return success
    return NextResponse.json({
      orderId: order.id,
      orderNumber,
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
