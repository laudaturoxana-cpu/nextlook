import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return admins.includes(email)
}

const DPD_API_URL = 'https://api.dpd.ro/v1'
const ROMANIA_COUNTRY_ID = 642

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const awb = request.nextUrl.searchParams.get('awb')
    const mode = request.nextUrl.searchParams.get('mode') || 'print'

    const credentials = {
      userName: process.env.DPD_USERNAME!,
      password: process.env.DPD_PASSWORD!,
      clientSystemId: process.env.DPD_CLIENT_ID ? Number(process.env.DPD_CLIENT_ID) : undefined,
    }

    // ── mode=full: end-to-end test using real createDPDShipment ──────────────
    if (mode === 'full') {
      const { createDPDShipment } = await import('@/lib/dpd')
      const debug: Record<string, unknown> = {
        credentials: {
          userName: credentials.userName,
          hasPassword: !!credentials.password,
          clientSystemId: credentials.clientSystemId,
        },
        envSender: {
          DPD_SENDER_NAME: process.env.DPD_SENDER_NAME,
          DPD_SENDER_CITY: process.env.DPD_SENDER_CITY,
          DPD_SENDER_ADDRESS: process.env.DPD_SENDER_ADDRESS,
          DPD_SENDER_PHONE: process.env.DPD_SENDER_PHONE,
        },
      }

      let shipmentResult: any = null
      try {
        shipmentResult = await createDPDShipment({
          recipientName: 'Test Client',
          recipientPhone: '0700000000',
          recipientCity: 'Bucuresti',
          recipientAddress: 'Str. Test 1',
          total: 100,
          paymentMethod: 'ramburs',
          orderNumber: `TEST-${Date.now()}`,
          parcelsCount: 1,
        })
        debug.shipmentResult = shipmentResult
      } catch (err: any) {
        debug.shipmentError = err?.message
        return NextResponse.json({ debug })
      }

      // Test print for newly created shipment
      const printDebug: Record<string, unknown> = {}
      if (shipmentResult?.parcelIds?.length > 0) {
        await new Promise(r => setTimeout(r, 3000))
        for (const paperSize of ['A6', 'A4', 'A4_4xA6']) {
          for (const idType of ['number', 'string']) {
            const parcelId = idType === 'number'
              ? shipmentResult.parcelIds[0]
              : String(shipmentResult.parcelIds[0])
            const printPayload = {
              ...credentials,
              parcels: [{ id: parcelId }],
              outputType: 'PDF',
              paperSize,
            }
            const pr = await fetch(`${DPD_API_URL}/print`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
              body: JSON.stringify(printPayload),
            })
            const ct = pr.headers.get('content-type') || ''
            const allHeaders: Record<string, string> = {}
            pr.headers.forEach((v, k) => { allHeaders[k] = v })
            const key = `${paperSize}_id_${idType}`
            if (ct.includes('application/pdf')) {
              const buf = Buffer.from(await pr.arrayBuffer())
              printDebug[key] = {
                httpStatus: pr.status,
                bytes: buf.length,
                hasContent: buf.length > 2000,
                contentType: ct,
                preview: buf.slice(0, 80).toString('ascii').replace(/[^\x20-\x7E]/g, '.'),
              }
            } else {
              const body = await pr.text()
              printDebug[key] = { httpStatus: pr.status, contentType: ct, body: body.slice(0, 300), headers: allHeaders }
            }
          }
        }
      }
      debug.printDebug = printDebug

      return NextResponse.json({ debug })
    }

    // ── mode=site ────────────────────────────────────────────────────────────
    if (mode === 'site') {
      const city = request.nextUrl.searchParams.get('city') || 'Bucuresti'
      const res = await fetch(`${DPD_API_URL}/location/site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...credentials, countryId: ROMANIA_COUNTRY_ID, name: city }),
      })
      const data = await res.json()
      return NextResponse.json({ city, status: res.status, data })
    }

    // ── mode=shipment (legacy inline test) ───────────────────────────────────
    if (mode === 'shipment') {
      const siteRes = await fetch(`${DPD_API_URL}/location/site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...credentials, countryId: ROMANIA_COUNTRY_ID, name: 'Bucuresti' }),
      })
      const siteData = await siteRes.json()
      const siteId = siteData.sites?.[0]?.id

      const pickupDate = new Date()
      pickupDate.setDate(pickupDate.getDate() + 1)
      if (pickupDate.getDay() === 6) pickupDate.setDate(pickupDate.getDate() + 2)
      if (pickupDate.getDay() === 0) pickupDate.setDate(pickupDate.getDate() + 1)
      const pickupDateStr = pickupDate.toISOString().split('T')[0]

      const shipmentPayload = {
        ...credentials,
        recipient: {
          clientName: 'Test Client',
          privatePerson: true,
          address: { countryId: ROMANIA_COUNTRY_ID, siteId, addressNote: 'Str. Test 1' },
          phone1: { number: '0700000000' },
        },
        service: { serviceId: 2505, pickupDate: pickupDateStr },
        content: {
          parcels: [{ seqNo: 1, weight: 1 }],
          totalWeight: 1,
          contents: 'TEST',
          package: 'BOX',
        },
        payment: { courierServicePayer: 'SENDER' },
      }

      const res = await fetch(`${DPD_API_URL}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(shipmentPayload),
      })
      const text = await res.text()
      let parsed: unknown = null
      try { parsed = JSON.parse(text) } catch {}

      const shipmentData = parsed as any
      const newParcelId = shipmentData?.parcels?.[0]?.id
      const printResults: Record<string, unknown> = {}

      if (newParcelId) {
        await new Promise(r => setTimeout(r, 2000))
        for (const paperSize of ['A6', 'A4', 'A4_4xA6']) {
          const pr = await fetch(`${DPD_API_URL}/print`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ ...credentials, parcels: [{ id: newParcelId }], outputType: 'PDF', paperSize }),
          })
          const ct = pr.headers.get('content-type') || ''
          if (ct.includes('application/pdf')) {
            const buf = Buffer.from(await pr.arrayBuffer())
            printResults[paperSize] = { bytes: buf.length, hasContent: buf.length > 2000 }
          } else {
            printResults[`${paperSize}_err`] = await pr.text().then(t => t.slice(0, 200))
          }
        }
      }

      return NextResponse.json({ status: res.status, fullShipmentResponse: parsed, printResults })
    }

    // ── mode=print ───────────────────────────────────────────────────────────
    if (!awb) {
      return NextResponse.json({ error: 'Parametru ?awb=NUMAR lipsa. Sau adauga ?mode=site&city=Oras sau ?mode=shipment sau ?mode=full' })
    }

    const shipmentIdParam = request.nextUrl.searchParams.get('shipmentId')
    const results: Record<string, unknown> = {}

    const tryPrint = async (label: string, body: object) => {
      const res = await fetch(`${DPD_API_URL}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })
      const ct = res.headers.get('content-type') || ''
      const allHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { allHeaders[k] = v })
      if (ct.includes('application/pdf')) {
        const buf = Buffer.from(await res.arrayBuffer())
        results[label] = {
          httpStatus: res.status,
          bytes: buf.length,
          hasContent: buf.length > 2000,
          headers: allHeaders,
          preview: buf.slice(0, 120).toString('ascii').replace(/[^\x20-\x7E]/g, '.'),
        }
      } else {
        const text = await res.text()
        results[label] = { httpStatus: res.status, contentType: ct, headers: allHeaders, body: text.slice(0, 500) }
      }
    }

    const parcelIdStr = awb
    const parcelIdNum = parseInt(awb)

    await tryPrint('str_A6',          { ...credentials, parcels: [{ id: parcelIdStr }], outputType: 'PDF', paperSize: 'A6' })
    await tryPrint('str_A4_4xA6',     { ...credentials, parcels: [{ id: parcelIdStr }], outputType: 'PDF', paperSize: 'A4_4xA6' })
    await tryPrint('num_A6',          { ...credentials, parcels: [{ id: parcelIdNum }], outputType: 'PDF', paperSize: 'A6' })
    await tryPrint('num_A4_4xA6',     { ...credentials, parcels: [{ id: parcelIdNum }], outputType: 'PDF', paperSize: 'A4_4xA6' })
    await tryPrint('no_outputType',   { ...credentials, parcels: [{ id: parcelIdStr }], paperSize: 'A6' })
    await tryPrint('labelFormat_PDF', { ...credentials, parcels: [{ id: parcelIdStr }], labelFormat: 'PDF', paperSize: 'A6' })

    if (shipmentIdParam) {
      await tryPrint('shipmentId_str', { ...credentials, shipmentId: shipmentIdParam, outputType: 'PDF', paperSize: 'A6' })
      await tryPrint('shipmentId_num', { ...credentials, shipmentId: parseInt(shipmentIdParam), outputType: 'PDF', paperSize: 'A6' })
    }

    return NextResponse.json({ awb, results })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
