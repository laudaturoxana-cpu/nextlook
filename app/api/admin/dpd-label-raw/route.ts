import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

const DPD_API_URL = 'https://api.dpd.ro/v1'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const awb = request.nextUrl.searchParams.get('awb')
    const mode = request.nextUrl.searchParams.get('mode') || 'raw' // raw | debug

    if (!awb) {
      return NextResponse.json({ error: 'Parametru ?awb=NUMAR lipsa' })
    }

    const credentials = {
      userName: process.env.DPD_USERNAME!,
      password: process.env.DPD_PASSWORD!,
      clientSystemId: process.env.DPD_CLIENT_ID ? Number(process.env.DPD_CLIENT_ID) : undefined,
    }

    const paperSize = request.nextUrl.searchParams.get('paperSize') || 'A4_4xA6'
    const useNumber = request.nextUrl.searchParams.get('useNumber') === '1'
    const parcelId = useNumber ? parseInt(awb) : awb

    const payload = {
      ...credentials,
      parcels: [{ id: parcelId }],
      outputType: 'PDF',
      paperSize,
    }

    // ── mode=debug: full diagnostic info ────────────────────────────────────
    if (mode === 'debug') {
      const debug: Record<string, unknown> = {
        requestPayload: {
          ...payload,
          password: '***',
        },
        parcelIdType: typeof parcelId,
        parcelIdValue: parcelId,
      }

      // Test all combinations
      const combos = [
        { label: 'str_A6',      parcels: [{ id: awb }],           outputType: 'PDF', paperSize: 'A6' },
        { label: 'str_A4',      parcels: [{ id: awb }],           outputType: 'PDF', paperSize: 'A4' },
        { label: 'str_A4_4xA6', parcels: [{ id: awb }],           outputType: 'PDF', paperSize: 'A4_4xA6' },
        { label: 'num_A6',      parcels: [{ id: parseInt(awb) }], outputType: 'PDF', paperSize: 'A6' },
        { label: 'num_A4',      parcels: [{ id: parseInt(awb) }], outputType: 'PDF', paperSize: 'A4' },
        { label: 'num_A4_4xA6', parcels: [{ id: parseInt(awb) }], outputType: 'PDF', paperSize: 'A4_4xA6' },
        { label: 'shipId_str_A6',      shipmentId: awb,           outputType: 'PDF', paperSize: 'A6' },
        { label: 'shipId_str_A4_4xA6', shipmentId: awb,           outputType: 'PDF', paperSize: 'A4_4xA6' },
        { label: 'shipId_num_A6',      shipmentId: parseInt(awb), outputType: 'PDF', paperSize: 'A6' },
        { label: 'shipId_num_A4_4xA6', shipmentId: parseInt(awb), outputType: 'PDF', paperSize: 'A4_4xA6' },
      ]

      const results: Record<string, unknown> = {}

      for (const combo of combos) {
        const { label, ...rest } = combo
        const body = { ...credentials, ...rest }
        try {
          const res = await fetch(`${DPD_API_URL}/print`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body),
          })
          const ct = res.headers.get('content-type') || ''
          const allHeaders: Record<string, string> = {}
          res.headers.forEach((v, k) => { allHeaders[k] = v })
          const buf = Buffer.from(await res.arrayBuffer())

          const isPdf = ct.includes('application/pdf')
          const previewAscii = buf.slice(0, 200).toString('ascii').replace(/[^\x20-\x7E]/g, '.')
          const previewHex = buf.slice(0, 40).toString('hex')

          // Check for PDF header
          const hasPdfHeader = buf.slice(0, 4).toString('ascii') === '%PDF'
          // Check for embedded JS action (sign of blank PDF)
          const bufStr = buf.toString('binary')
          const hasJsAction = bufStr.includes('/AA') || bufStr.includes('/JS') || bufStr.includes('JavaScript')
          const hasImageContent = bufStr.includes('/Image') || bufStr.includes('stream')

          results[label] = {
            httpStatus: res.status,
            contentType: ct,
            bytes: buf.length,
            isPdf,
            hasPdfHeader,
            hasJsAction,
            hasImageContent,
            headers: allHeaders,
            previewAscii,
            previewHex,
            // Full content as base64 for small responses
            base64: buf.length < 50000 ? buf.toString('base64') : `[too large: ${buf.length} bytes]`,
          }
        } catch (e: any) {
          results[label] = { error: e?.message }
        }
      }

      debug.results = results
      return NextResponse.json(debug)
    }

    // ── mode=raw: return raw PDF bytes ───────────────────────────────────────
    const res = await fetch(`${DPD_API_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })

    const ct = res.headers.get('content-type') || ''
    const buf = Buffer.from(await res.arrayBuffer())

    if (!ct.includes('application/pdf')) {
      const text = buf.toString('utf-8')
      return NextResponse.json({
        error: 'DPD did not return PDF',
        httpStatus: res.status,
        contentType: ct,
        body: text.slice(0, 500),
      })
    }

    // Return raw PDF with proper headers
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(buf.length),
        'Content-Disposition': `inline; filename="awb-${awb}-${paperSize}.pdf"`,
        'X-DPD-Bytes': String(buf.length),
        'X-DPD-Status': String(res.status),
      },
    })

  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
