import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userName = process.env.DPD_USERNAME
  const password = process.env.DPD_PASSWORD
  const clientSystemId = process.env.DPD_CLIENT_ID ? Number(process.env.DPD_CLIENT_ID) : undefined

  const creds = { userName, password, clientSystemId }

  // Step 1: Test site lookup
  let siteId: number | null = null
  let siteError: string | null = null

  try {
    const siteRes = await fetch('https://api.dpd.ro/v1/location/site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ...creds, countryId: 642, name: 'Brasov' }),
    })
    const siteData = await siteRes.json()
    siteId = siteData.sites?.[0]?.id || null
    if (!siteId) siteError = JSON.stringify(siteData)
  } catch (e: any) {
    siteError = e.message
  }

  if (!siteId) {
    return NextResponse.json({ step: 'site_lookup_failed', siteError })
  }

  // Step 2: Test shipment creation
  let shipmentResult: unknown = null
  let shipmentError: string | null = null

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const pickupDate = tomorrow.toISOString().split('T')[0]

  try {
    const shipRes = await fetch('https://api.dpd.ro/v1/shipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ...creds,
        recipient: {
          clientName: 'Test Client',
          privatePerson: true,
          address: {
            countryId: 642,
            siteId,
            addressNote: 'Strada Test 1',
            postCode: '',
          },
          phoneNumber: '0722123456',
        },
        service: { serviceId: 2505, pickupDate },
        content: {
          parcels: [{ seqNo: 1, weight: 1 }],
          totalWeight: 1,
          contents: 'Test produse textile',
          package: 'BOX',
        },
        payment: { payerType: 'SENDER' },
      }),
    })
    shipmentResult = await shipRes.json()
  } catch (e: any) {
    shipmentError = e.message
  }

  return NextResponse.json({
    siteId,
    shipmentResult,
    shipmentError,
  })
}
