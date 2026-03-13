import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDPDLabel } from '@/lib/dpd'

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

    const awbNumber = request.nextUrl.searchParams.get('awb')
    if (!awbNumber) {
      return NextResponse.json({ error: 'AWB lipsă' }, { status: 400 })
    }

    const parcelId = parseInt(awbNumber)
    if (isNaN(parcelId)) {
      return NextResponse.json({ error: 'AWB invalid' }, { status: 400 })
    }

    const pdfBase64 = await getDPDLabel([parcelId])
    if (!pdfBase64) {
      return NextResponse.json({ error: 'Nu s-a putut genera eticheta DPD' }, { status: 500 })
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64')
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="awb-${awbNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Label download error:', error)
    return NextResponse.json({ error: 'Eroare la descărcarea etichetei' }, { status: 500 })
  }
}
