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

  // Pickup date: today if before 15:00, tomorrow otherwise
  const pickupDate = new Date()
  if (pickupDate.getHours() >= 15) {
    pickupDate.setDate(pickupDate.getDate() + 1)
  }
  // Skip weekends
  if (pickupDate.getDay() === 6) pickupDate.setDate(pickupDate.getDate() + 2)
  if (pickupDate.getDay() === 0) pickupDate.setDate(pickupDate.getDate() + 1)

  const pickupDateStr = pickupDate.toISOString().split('T')[0]

  const requestBody: Record<string, unknown> = {
    ...credentials,
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
    payment: {
      courierServicePayer: 'SENDER',
    },
  }

  // Add COD for ramburs payment
  if (paymentMethod === 'ramburs') {
    requestBody.additionalServices = {
      cod: {
        amount: total,
        currencyCode: 'RON',
        processingType: 'CASH',
      },
    }
  }

  const response = await fetch(`${DPD_API_URL}/shipment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(requestBody),
  })

  const responseText = await response.text()
  console.log('DPD shipment raw response (status', response.status, '):', responseText.slice(0, 500))

  let data: any
  try {
    data = JSON.parse(responseText)
  } catch {
    throw new Error(`DPD returned non-JSON response (${response.status}): ${responseText.slice(0, 300)}`)
  }

  if (data.error) {
    throw new Error(`DPD error: ${data.error.message || JSON.stringify(data.error)}`)
  }

  if (!data.id) {
    throw new Error(`DPD: răspuns invalid - ${JSON.stringify(data)}`)
  }

  const parcelIds: number[] = data.parcels?.map((p: { id: number }) => p.id) || []
  // parcel.id is the actual DPD tracking/AWB number, not seqNo
  const awbNumber = data.parcels?.[0]?.id?.toString() || data.id.toString()
  console.log('DPD shipment created:', JSON.stringify(data.parcels))

  return {
    shipmentId: data.id,
    parcelIds,
    awbNumber,
  }
}

// Get AWB label as PDF buffer
export async function getDPDLabel(parcelIds: number[]): Promise<Buffer | null> {
  const credentials = getCredentials()

  try {
    const response = await fetch(`${DPD_API_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ...credentials,
        parcels: parcelIds.map(id => ({ id })),
        outputType: 'PDF',
        paperSize: 'A4_4xA6',
      }),
    })

    const contentType = response.headers.get('content-type') || ''

    // DPD returns PDF directly as binary
    if (contentType.includes('application/pdf')) {
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length === 0) return null
      return buffer
    }

    // Fallback: try JSON (base64)
    const data = await response.json()
    const b64 = data.pdf || data.base64 || null
    if (!b64) return null
    return Buffer.from(b64, 'base64')
  } catch (error) {
    console.error('DPD getLabel error:', error)
    return null
  }
}
