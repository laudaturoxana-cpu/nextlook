import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDPDLabel } from '@/lib/dpd'

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

    const awbNumber = request.nextUrl.searchParams.get('awb')
    if (!awbNumber) {
      return NextResponse.json({ error: 'AWB lipsă' }, { status: 400 })
    }

    const parcelId = parseInt(awbNumber)
    if (isNaN(parcelId)) {
      return NextResponse.json({ error: 'AWB invalid' }, { status: 400 })
    }

    const pdfBuffer = await getDPDLabel([parcelId])
    if (!pdfBuffer) {
      return NextResponse.json({ error: 'Nu s-a putut genera eticheta DPD. AWB-ul poate fi expirat sau invalid.' }, { status: 500 })
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
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
