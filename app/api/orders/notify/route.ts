import { NextRequest, NextResponse } from 'next/server'
import { sendOwnerOrderNotification, sendCustomerOrderConfirmation } from '@/lib/emails'

export const dynamic = 'force-dynamic'

// Called from order-confirmation page after successful Stripe payment
export async function POST(request: NextRequest) {
  try {
    const emailData = await request.json()

    await Promise.all([
      sendOwnerOrderNotification(emailData),
      sendCustomerOrderConfirmation(emailData),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Order notify email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
