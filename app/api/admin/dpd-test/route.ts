import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    if (mode === 'site') {
      // Test city lookup
      const city = request.nextUrl.searchParams.get('city') || 'Bucuresti'
      const res = await fetch(`${DPD_API_URL}/location/site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...credentials, countryId: ROMANIA_COUNTRY_ID, name: city }),
      })
      const data = await res.json()
      return NextResponse.json({ city, status: res.status, data })
    }

    if (mode === 'shipment') {
      // Test create shipment
      const siteRes = await fetch(`${DPD_API_URL}/location/site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...credentials, countryId: ROMANIA_COUNTRY_ID, name: 'Bucuresti' }),
      })
      const siteData = await siteRes.json()
      const siteId = siteData.sites?.[0]?.id

      // Next working day for pickup
      const pickupDate = new Date()
      pickupDate.setDate(pickupDate.getDate() + 1)
      if (pickupDate.getDay() === 6) pickupDate.setDate(pickupDate.getDate() + 2)
      if (pickupDate.getDay() === 0) pickupDate.setDate(pickupDate.getDate() + 1)
      const pickupDateStr = pickupDate.toISOString().split('T')[0]

      const res = await fetch(`${DPD_API_URL}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
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
        }),
      })
      const text = await res.text()
      let parsed: unknown = null
      try { parsed = JSON.parse(text) } catch {}

      // Also try printing immediately with the new shipment
      const shipmentData = parsed as any
      const newParcelId = shipmentData?.parcels?.[0]?.id
      const newShipmentId = shipmentData?.id
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

    // mode === 'print' - test print for an AWB
    if (!awb) {
      return NextResponse.json({ error: 'Parametru ?awb=NUMAR lipsa. Sau adauga ?mode=site&city=Oras sau ?mode=shipment' })
    }

    const parcelId = parseInt(awb)
    const shipmentIdParam = request.nextUrl.searchParams.get('shipmentId')
    const results: Record<string, unknown> = {}

    // Test 1: parcels:[{id}] with all paper sizes
    for (const paperSize of ['A6', 'A4', 'A4_4xA6']) {
      const res = await fetch(`${DPD_API_URL}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...credentials, parcels: [{ id: parcelId }], outputType: 'PDF', paperSize }),
      })
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/pdf')) {
        const buf = Buffer.from(await res.arrayBuffer())
        results[`parcels_${paperSize}`] = { bytes: buf.length, hasContent: buf.length > 2000 }
      } else {
        const text = await res.text()
        results[`parcels_${paperSize}_err`] = { status: res.status, body: text.slice(0, 200) }
      }
    }

    // Test 2: shipmentId approach (if provided)
    if (shipmentIdParam) {
      const res = await fetch(`${DPD_API_URL}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...credentials, shipmentId: parseInt(shipmentIdParam), outputType: 'PDF', paperSize: 'A6' }),
      })
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/pdf')) {
        const buf = Buffer.from(await res.arrayBuffer())
        results['shipmentId_A6'] = { bytes: buf.length, hasContent: buf.length > 2000 }
      } else {
        results['shipmentId_A6_err'] = { status: res.status, body: await res.text().then(t => t.slice(0, 300)) }
      }
    }

    return NextResponse.json({ awb, shipmentId: shipmentIdParam, results })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
