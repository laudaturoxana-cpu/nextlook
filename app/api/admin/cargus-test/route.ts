import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCargusShipment, getCargusLabel } from '@/lib/cargus'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mode = request.nextUrl.searchParams.get('mode') || 'login'

    // ── mode=login: testează doar autentificarea ─────────────────────────────
    if (mode === 'login') {
      const response = await fetch('https://urgentcargus.azure-api.net/api/LoginUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.CARGUS_API_KEY!,
        },
        body: JSON.stringify({
          UserName: process.env.CARGUS_USERNAME!,
          Password: process.env.CARGUS_PASSWORD!,
        }),
      })
      const text = await response.text()
      const ok = response.ok && text.length > 10
      return NextResponse.json({
        status: response.status,
        ok,
        tokenPreview: ok ? text.slice(0, 20) + '...' : null,
        error: ok ? null : text.slice(0, 300),
        env: {
          hasUsername: !!process.env.CARGUS_USERNAME,
          hasPassword: !!process.env.CARGUS_PASSWORD,
          hasApiKey: !!process.env.CARGUS_API_KEY,
          hasSenderClientId: !!process.env.CARGUS_SENDER_CLIENT_ID,
        },
      })
    }

    // ── mode=awb: crează un AWB de test ──────────────────────────────────────
    if (mode === 'awb') {
      const orderNumber = `TEST-${Date.now()}`
      const result = await createCargusShipment({
        recipientName: 'Test Client',
        recipientPhone: '0700000000',
        recipientCity: 'Bucuresti',
        recipientCounty: 'Ilfov',
        recipientAddress: 'Str. Test 1',
        total: 100,
        paymentMethod: 'card',
        orderNumber,
        parcelsCount: 1,
      })
      return NextResponse.json({ ok: true, awbNumber: result.awbNumber, orderNumber })
    }

    // ── mode=label: descarcă eticheta pentru un AWB ──────────────────────────
    if (mode === 'label') {
      const awb = request.nextUrl.searchParams.get('awb')
      if (!awb) return NextResponse.json({ error: 'Parametru ?awb=NUMAR lipsa' })
      const buffer = await getCargusLabel(awb)
      if (!buffer) return NextResponse.json({ error: 'Eticheta nu a putut fi descarcata' })
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="cargus-${awb}.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: 'mode invalid. Foloseste: ?mode=login | ?mode=awb | ?mode=label&awb=NUMAR' })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
