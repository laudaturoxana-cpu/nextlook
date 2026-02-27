const DPD_API_URL = 'https://api.dpd.ro/v1'
const ROMANIA_COUNTRY_ID = 642

function getCredentials() {
  return {
    userName: process.env.DPD_USERNAME!,
    password: process.env.DPD_PASSWORD!,
    clientSystemId: process.env.DPD_CLIENT_ID ? Number(process.env.DPD_CLIENT_ID) : undefined,
  }
}

// Get DPD site ID for a given city name
export async function getDPDSiteId(cityName: string): Promise<number | null> {
  const credentials = getCredentials()

  // Normalize city name for DPD
  const normalizedCity = cityName
    .replace('ș', 's').replace('ț', 't').replace('ă', 'a')
    .replace('â', 'a').replace('î', 'i')
    .replace('Ș', 'S').replace('Ț', 'T').replace('Ă', 'A')
    .replace('Â', 'A').replace('Î', 'I')

  try {
    const response = await fetch(`${DPD_API_URL}/location/site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ...credentials,
        countryId: ROMANIA_COUNTRY_ID,
        name: normalizedCity,
      }),
    })

    const data = await response.json()
    console.log('DPD site lookup for', normalizedCity, ':', JSON.stringify(data).slice(0, 300))

    if (data.sites && data.sites.length > 0) {
      return data.sites[0].id
    }
  } catch (error) {
    console.error('DPD getSiteId error:', error)
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
      phoneNumber: recipientPhone.replace(/\s/g, ''),
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

  const data = await response.json()
  console.log('DPD shipment raw response:', JSON.stringify(data))

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

// Get AWB label as PDF base64
export async function getDPDLabel(parcelIds: number[]): Promise<string | null> {
  const credentials = getCredentials()

  try {
    const response = await fetch(`${DPD_API_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ...credentials,
        parcels: parcelIds.map(id => ({ id })),
        outputType: 'PDF',
        labelFormat: 'A4',
      }),
    })

    const data = await response.json()
    return data.pdf || data.base64 || null
  } catch (error) {
    console.error('DPD getLabel error:', error)
    return null
  }
}
