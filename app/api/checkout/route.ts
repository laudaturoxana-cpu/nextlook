import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { generateOrderNumber } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
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

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        email,
        phone,
        shipping_name: fullName,
        shipping_address: address,
        shipping_city: city,
        shipping_county: county,
        shipping_postal_code: postalCode,
        subtotal,
        shipping_cost: shippingCost,
        discount: 0,
        total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        delivery_method: deliveryMethod,
        status: 'pending',
        notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw new Error('Failed to create order')
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      size: item.size,
      color: item.color,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id)
      throw new Error('Failed to create order items')
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
      await supabase
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
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}
