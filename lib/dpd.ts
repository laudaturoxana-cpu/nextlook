const DPD_API_URL = 'https://api.dpd.ro/v1'
const ROMANIA_COUNTRY_ID = 642

function getCredentials() {
  return {
    userName: process.env.DPD_USERNAME!,
    password: process.env.DPD_PASSWORD!,
    clientSystemId: process.env.DPD_CLIENT_ID ? Number(process.env.DPD_CLIENT_ID) : undefined,
  }
}

function normalizeCityName(cityName: string): string {
  return cityName
    .trim()
    // Romanian diacritics — comma-below (new standard)
    .replace(/ș/g, 's').replace(/ț/g, 't').replace(/Ș/g, 'S').replace(/Ț/g, 'T')
    // Romanian diacritics — cedilla (old standard)
    .replace(/ş/g, 's').replace(/ţ/g, 't').replace(/Ş/g, 'S').replace(/Ţ/g, 'T')
    // ă â î and uppercase
    .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
    .replace(/Ă/g, 'A').replace(/Â/g, 'A').replace(/Î/g, 'I')
    // Other accented Latin letters (in case of keyboard/paste issues)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
}

async function searchDPDSite(credentials: object, name: string): Promise<number | null> {
  try {
    const response = await fetch(`${DPD_API_URL}/location/site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ...credentials, countryId: ROMANIA_COUNTRY_ID, name }),
    })
    const data = await response.json()
    console.log('DPD site lookup for', name, ':', JSON.stringify(data).slice(0, 200))
    if (data.sites && data.sites.length > 0) return data.sites[0].id
  } catch (error) {
    console.error('DPD getSiteId error for', name, ':', error)
  }
  return null
}

// Get DPD site ID for a given city name
export async function getDPDSiteId(cityName: string): Promise<number | null> {
  const credentials = getCredentials()
  const normalized = normalizeCityName(cityName.trim())

  // Try variations: as-is, space→hyphen, hyphen→space, first word only
  const variations = [
    normalized,
    normalized.replace(/\s+/g, '-'),
    normalized.replace(/-/g, ' '),
    normalized.split(/[\s-]/)[0],
  ].filter((v, i, arr) => v && arr.indexOf(v) === i) // deduplicate

  for (const variant of variations) {
    const siteId = await searchDPDSite(credentials, variant)
    if (siteId) return siteId
  }

  return null
}

export interface CreateShipmentParams {
  recipientName: string
  recipientPhone: string
  recipientCity: string
  recipientAddress: string
  recipientPostCode?: string
  total: number
  paymentMethod: string
  orderNumber: string
  parcelsCount?: number
}

export interface DPDShipmentResult {
  shipmentId: number
  parcelIds: number[]
  barcodes: string[]
  awbNumber: string
}

// Create a DPD shipment and return AWB info
export async function createDPDShipment(params: CreateShipmentParams): Promise<DPDShipmentResult> {
  const credentials = getCredentials()

  const {
    recipientName,
    recipientPhone,
    recipientCity,
    recipientAddress,
    total,
    paymentMethod,
    orderNumber,
    parcelsCount = 1,
  } = params

  // Get site ID for recipient city
  const siteId = await getDPDSiteId(recipientCity)
  if (!siteId) {
    throw new Error(`Nu am găsit orașul "${recipientCity}" în rețeaua DPD`)
  }

  // NEXTLOOK SRL clientId — Moieciu de Sus, str. Principala 20
  const NEXTLOOK_CLIENT_ID = 50929196303

  // Helper: get next business day starting from daysAhead offset
  function getPickupDate(daysAhead: number): string {
    const d = new Date()
    d.setDate(d.getDate() + daysAhead)
    if (d.getDay() === 6) d.setDate(d.getDate() + 2)
    if (d.getDay() === 0) d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  function buildBody(pickupDateStr: string): Record<string, unknown> {
    const body: Record<string, unknown> = {
      ...credentials,
      sender: { clientId: NEXTLOOK_CLIENT_ID },
      recipient: {
        clientName: recipientName,
        privatePerson: true,
        address: {
          countryId: ROMANIA_COUNTRY_ID,
          siteId,
          addressNote: recipientAddress,
        },
        phone1: { number: recipientPhone.replace(/\s/g, '') },
      },
      service: {
        serviceId: 2505, // DPD STANDARD
        pickupDate: pickupDateStr,
      },
      content: {
        parcels: Array.from({ length: parcelsCount }, (_, i) => ({ seqNo: i + 1, weight: 1 })),
        totalWeight: parcelsCount,
        contents: `Comanda ${orderNumber} - produse vestimentare`,
        package: 'BOX',
      },
      payment: { courierServicePayer: 'SENDER' },
    }
    if (paymentMethod === 'ramburs') {
      body.additionalServices = {
        cod: { amount: total, currencyCode: 'RON', processingType: 'CASH' },
      }
    }
    return body
  }

  // Try pickup dates: tomorrow +1..+7 days — Moieciu de Sus is served only on certain weekdays
  let responseText = ''
  let lastPickupDate = ''
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    lastPickupDate = getPickupDate(daysAhead)
    const res = await fetch(`${DPD_API_URL}/shipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(buildBody(lastPickupDate)),
    })
    responseText = await res.text()
    console.log(`DPD shipment attempt [${lastPickupDate}] status ${res.status}:`, responseText.slice(0, 300))

    // If error is about pickup day not served, try next day
    let parsed: any
    try { parsed = JSON.parse(responseText) } catch { break }
    if (parsed?.error?.message && (
      parsed.error.message.includes('nu este deservita') ||
      parsed.error.message.includes('afara orelor de program') ||
      parsed.error.message.includes('data de preluare') ||
      parsed.error.message.includes('zi de preluare')
    )) {
      console.log(`DPD pickup not available on ${lastPickupDate}, trying next day...`)
      continue
    }
    break // success or different error — stop retrying
  }
  console.log('DPD shipment raw response:', responseText.slice(0, 500))

  let data: any
  try {
    data = JSON.parse(responseText)
  } catch {
    throw new Error(`DPD returned non-JSON response: ${responseText.slice(0, 300)}`)
  }

  if (data.error) {
    throw new Error(`DPD error: ${data.error.message || JSON.stringify(data.error)}`)
  }

  if (!data.id) {
    throw new Error(`DPD: răspuns invalid - ${JSON.stringify(data)}`)
  }

  const parcelIds: number[] = data.parcels?.map((p: { id: number }) => p.id) || []
  const barcodes: string[] = data.parcels?.map((p: { barcode?: string; id: number }) => p.barcode || p.id.toString()) || []
  const awbNumber = barcodes[0] || data.parcels?.[0]?.id?.toString() || data.id.toString()
  console.log('DPD shipment created - full parcels:', JSON.stringify(data.parcels), '| shipmentId:', data.id)

  // Wait 3s for DPD to finish processing before label is available
  await new Promise(resolve => setTimeout(resolve, 3000))

  return {
    shipmentId: data.id,
    parcelIds,
    barcodes,
    awbNumber,
  }
}

// Build parcel list for print — always use parcel.id format (confirmed working)
function buildPrintParcels(parcelIds: number[], barcodes?: string[]) {
  if (barcodes && barcodes.length > 0) {
    return barcodes.map(id => ({ parcel: { id } }))
  }
  return parcelIds.map(id => ({ parcel: { id: id.toString() } }))
}

// Try /print/extended — returns base64 JSON, more reliable on serverless
async function tryDPDPrintExtended(credentials: object, parcelIds: number[], barcodes: string[], paperSize: string): Promise<Buffer | null> {
  try {
    const response = await fetch(`${DPD_API_URL}/print/extended`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ...credentials,
        language: 'RO',
        format: 'pdf',
        paperSize,
        parcels: buildPrintParcels(parcelIds, barcodes),
      }),
    })

    const text = await response.text()
    let json: any
    try { json = JSON.parse(text) } catch { return null }

    if (json.error) {
      console.warn(`DPD print/extended [${paperSize}] error:`, json.error?.message)
      return null
    }

    if (json.data) {
      const buffer = Buffer.from(json.data, 'base64')
      console.log(`DPD print/extended [${paperSize}] base64 decoded: ${buffer.length} bytes`)
      if (buffer.length > 2000) return buffer
      console.warn(`DPD print/extended [${paperSize}] too small (${buffer.length} bytes)`)
      return null
    }

    console.warn(`DPD print/extended [${paperSize}] no data field:`, text.slice(0, 200))
    return null
  } catch (e) {
    console.error(`DPD print/extended [${paperSize}] error:`, e)
    return null
  }
}

// Try /print — returns raw PDF binary
async function tryDPDPrint(credentials: object, parcelIds: number[], barcodes: string[], paperSize: string): Promise<Buffer | null> {
  try {
    const response = await fetch(`${DPD_API_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ...credentials,
        language: 'RO',
        format: 'pdf',
        paperSize,
        parcels: buildPrintParcels(parcelIds, barcodes),
      }),
    })

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/pdf')) {
      const buffer = Buffer.from(await response.arrayBuffer())
      console.log(`DPD print [${paperSize}] buffer: ${buffer.length} bytes`)
      if (buffer.length > 2000) return buffer
      console.warn(`DPD print [${paperSize}] suspiciously small (${buffer.length} bytes) - blank PDF`)
      return null
    }

    const text = await response.text()
    console.log(`DPD print [${paperSize}] non-PDF (${response.status}):`, text.slice(0, 200))
    return null
  } catch (e) {
    console.error(`DPD print [${paperSize}] error:`, e)
    return null
  }
}

// Get AWB label as PDF buffer — tries /print/extended (base64) then /print (binary)
export async function getDPDLabel(parcelIds: number[], barcodes: string[] = []): Promise<Buffer | null> {
  const credentials = getCredentials()

  for (const paperSize of ['A6', 'A4', 'A4_4xA6']) {
    const buffer = await tryDPDPrintExtended(credentials, parcelIds, barcodes, paperSize)
    if (buffer) return buffer
  }

  // Fallback to binary /print
  for (const paperSize of ['A6', 'A4', 'A4_4xA6']) {
    const buffer = await tryDPDPrint(credentials, parcelIds, barcodes, paperSize)
    if (buffer) return buffer
  }

  console.error('DPD getDPDLabel: all formats returned blank/empty PDF')
  return null
}
