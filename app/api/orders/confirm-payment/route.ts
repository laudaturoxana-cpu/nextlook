import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'orderId lipsă' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Fetch the order
    const { data: order, error: fetchError } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Comanda nu a fost găsită' }, { status: 404 })
    }

    // Already confirmed — nothing to do
    if (order.payment_status === 'paid') {
      return NextResponse.json({ ok: true })
    }

    // Verify payment with Stripe
    const paymentIntentId = order.stripe_payment_intent_id
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Nu există PaymentIntent pentru această comandă' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Plata nu a fost finalizată' }, { status: 400 })
    }

    // Update order status
    await adminSupabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('confirm-payment error:', error)
    return NextResponse.json({ error: error?.message || 'Eroare' }, { status: 500 })
  }
}
