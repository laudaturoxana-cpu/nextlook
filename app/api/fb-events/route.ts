import { NextRequest, NextResponse } from 'next/server'
import { sendCAPIEvent, CAPIEvent } from '@/lib/facebook-capi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
    const ua = request.headers.get('user-agent') || undefined

    const event: CAPIEvent = {
      ...body,
      client_ip_address: ip,
      client_user_agent: ua,
    }

    await sendCAPIEvent(event)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
