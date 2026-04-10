/**
 * Cargus API Integration
 * Base URL: https://urgentcargus.azure-api.net/api
 * Auth: Azure API Management subscription key (Ocp-Apim-Subscription-Key)
 *       + Bearer token from /LoginUser
 *
 * Env vars needed:
 *   CARGUS_USERNAME            - userul din WebExpress (ex: nextlook)
 *   CARGUS_PASSWORD            - parola din WebExpress
 *   CARGUS_API_KEY             - Primary Key din portalul Azure
 *   CARGUS_SENDER_CLIENT_ID    - ID punct de ridicare (ex: 1228435)
 *   CARGUS_SENDER_NAME         - Numele firmei expeditor
 *   CARGUS_SENDER_PHONE        - Telefonul expeditorului
 *   CARGUS_SENDER_LOCALITY_ID  - LocalityId numeric Brașov = 153
 *   CARGUS_SENDER_ADDRESS      - Adresa expeditorului
 *   CARGUS_SENDER_COUNTY_ID    - CountyId numeric Brașov = 11
 */

const CARGUS_BASE_URL = 'https://urgentcargus.azure-api.net/api'

// Cache token in-memory to avoid login on every request (valid ~1h)
let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getCargusToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiry) return cachedToken

  const response = await fetch(`${CARGUS_BASE_URL}/LoginUser`, {
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

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cargus login failed (${response.status}): ${text.slice(0, 300)}`)
  }

  const token = await response.text()
  cachedToken = token.replace(/^"|"$/g, '')
  tokenExpiry = now + 55 * 60 * 1000
  console.log('Cargus: token obtinut cu succes')
  return cachedToken
}

function cargusHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': process.env.CARGUS_API_KEY!,
    'Authorization': `Bearer ${token}`,
  }
}

// Hartă statică pentru orașele principale — evită 46 de request-uri la fiecare comandă
// LocalityId-uri confirmate din API-ul Cargus
const CITY_LOCALITY_MAP: Record<string, number> = {
  'BUCURESTI': 150, 'BUCUREŞTI': 150, 'BUCHAREST': 150,
  'CLUJ-NAPOCA': 179, 'CLUJ NAPOCA': 179, 'CLUJ': 179,
  'TIMISOARA': 155, 'TIMIŞOARA': 155,
  'IASI': 171, 'IAŞI': 171,
  'BRASOV': 153, 'BRAŞOV': 153,
  'CONSTANTA': 156, 'CONSTANŢA': 156,
  'CRAIOVA': 159, 'GALATI': 163, 'GALAŢI': 163,
  'PLOIESTI': 175, 'PLOIEŞTI': 175,
  'ORADEA': 174, 'SIBIU': 176,
  'BACAU': 152, 'BACĂU': 152,
  'PITESTI': 151, 'PITEŞTI': 151,
  'ARAD': 154, 'TARGU MURES': 189, 'TÂRGU MUREŞ': 189,
  'BAIA MARE': 191, 'BUZAU': 157, 'BUZĂU': 157,
  'SATU MARE': 177, 'SUCEAVA': 180, 'DROBETA TURNU SEVERIN': 161,
  'RAMNICU VALCEA': 184, 'RÂMNICU VÂLCEA': 184,
  'TARGOVISTE': 182, 'TÂRGOVIŞTE': 182,
  'DEVA': 166, 'ALBA IULIA': 148, 'BISTRITA': 158, 'BISTRIŢA': 158,
  'RESIN': 167, 'SFANTU GHEORGHE': 178, 'SFÂNTUL GHEORGHE': 178,
  'MIERCUREA CIUC': 169, 'PIATRA NEAMT': 172, 'PIATRA NEAMŢ': 172,
  'SLOBOZIA': 167, 'ALEXANDRIA': 181, 'GIURGIU': 164,
  'CALARASI': 160, 'CĂLĂRAŞI': 160, 'TULCEA': 183,
  'VASLUI': 186, 'FOCSANI': 187, 'FOCŞANI': 187,
  'DROBETA-TURNU SEVERIN': 161, 'TURNU SEVERIN': 161,
}

// Toate localitățile Cargus din România — fișier static generat o singură dată
// 13.636 localități, lookup instant fără API calls
import allLocalitiesData from './cargus-localities.json'
const ALL_LOCALITIES: Record<string, number> = allLocalitiesData as Record<string, number>

const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()

async function getCargusLocalityId(_token: string, cityName: string, _countyName: string): Promise<number | null> {
  const normalizedCity = normalize(cityName)

  // Caută în harta statică a orașelor mari (pentru compatibilitate)
  if (CITY_LOCALITY_MAP[normalizedCity]) {
    return CITY_LOCALITY_MAP[normalizedCity]
  }

  // Caută în lista completă de 13.636 localități (fișier static, fără API calls)
  if (ALL_LOCALITIES[normalizedCity]) {
    console.log(`Cargus: LocalityId pentru "${cityName}" = ${ALL_LOCALITIES[normalizedCity]}`)
    return ALL_LOCALITIES[normalizedCity]
  }

  console.warn(`Cargus: nu am găsit LocalityId pentru "${cityName}"`)
  return null
}

export interface CreateCargusShipmentParams {
  recipientName: string
  recipientPhone: string
  recipientCity: string
  recipientCounty: string
  recipientAddress: string
  recipientPostCode?: string
  total: number
  paymentMethod: string
  orderNumber: string
  parcelsCount?: number
}

export interface CargusShipmentResult {
  awbNumber: string
}

export async function createCargusShipment(params: CreateCargusShipmentParams): Promise<CargusShipmentResult> {
  const token = await getCargusToken()

  const {
    recipientName,
    recipientPhone,
    recipientCity,
    recipientCounty,
    recipientAddress,
    recipientPostCode,
    total,
    paymentMethod,
    orderNumber,
    parcelsCount = 1,
  } = params

  const isRamburs = paymentMethod === 'ramburs'

  // Sender — folosim LocalityId numeric (153 = Brașov) și CountyId (11 = Brașov)
  const sender: Record<string, unknown> = {
    Name: process.env.CARGUS_SENDER_NAME || 'NEXTLOOK SRL',
    ContactPerson: process.env.CARGUS_SENDER_NAME || 'NEXTLOOK SRL',
    Phone: process.env.CARGUS_SENDER_PHONE || '0749976984',
    LocalityId: process.env.CARGUS_SENDER_LOCALITY_ID ? parseInt(process.env.CARGUS_SENDER_LOCALITY_ID) : 153,
    CountyId: process.env.CARGUS_SENDER_COUNTY_ID ? parseInt(process.env.CARGUS_SENDER_COUNTY_ID) : 11,
    AddressText: process.env.CARGUS_SENDER_ADDRESS || 'Str Carpatilor 6',
  }

  // ParcelCodes — Type:1 = colet, cu dimensiuni standard
  const parcelCodes = Array.from({ length: parcelsCount }, (_, i) => ({
    Type: 1,
    Code: `${orderNumber}-${i + 1}`,
    Weight: 1,
    Length: 30,
    Width: 20,
    Height: 15,
  }))

  // Caută LocalityId pentru destinatar
  const recipientLocalityId = await getCargusLocalityId(token, recipientCity, recipientCounty)

  const recipient: Record<string, unknown> = {
    ContactPerson: recipientName,
    Phone: recipientPhone.replace(/\s/g, ''),
    CountyName: recipientCounty,
    AddressText: recipientAddress,
    PostalCode: recipientPostCode || '000000',
    IsCompany: false,
  }
  if (recipientLocalityId) {
    recipient.LocalityId = recipientLocalityId
  } else {
    // Trimite fără diacritice — Cargus nu acceptă caractere speciale în LocalityName
    recipient.LocalityName = normalize(recipientCity)
    recipient.CountyName = normalize(recipientCounty)
  }

  const body = {
    Sender: sender,
    Recipient: recipient,
    Parcels: parcelsCount,
    Envelopes: 0,
    TotalWeight: parcelsCount,
    ServiceId: 1,
    ShipmentPayer: 1,
    CashRepayment: isRamburs ? total : 0,
    BankRepayment: 0,
    OtherRepayment: '',
    OpenPackage: 0,
    SaturdayDelivery: 0,
    MorningDelivery: 0,
    Observations: `Comanda ${orderNumber}`,
    InternalNote: orderNumber,
    RemoteAreaDelivery: 0,
    CashRepaymentCurrency: 'RON',
    ParcelCodes: parcelCodes,
  }

  console.log('Cargus: creare AWB pentru comanda', orderNumber, '| ramburs:', isRamburs, '| suma:', isRamburs ? total : 0)

  const response = await fetch(`${CARGUS_BASE_URL}/Awbs`, {
    method: 'POST',
    headers: cargusHeaders(token),
    body: JSON.stringify(body),
  })

  const responseText = await response.text()
  console.log('Cargus AWB response (status', response.status, '):', responseText.slice(0, 500))

  if (!response.ok) {
    throw new Error(`Cargus AWB creare eșuată (${response.status}): ${responseText.slice(0, 300)}`)
  }

  let awbNumber: string
  try {
    const data = JSON.parse(responseText)
    awbNumber = Array.isArray(data) ? String(data[0]) : String(data)
  } catch {
    awbNumber = responseText.replace(/^"|"$/g, '').trim()
  }

  if (!awbNumber || awbNumber === 'null' || awbNumber === '0') {
    throw new Error(`Cargus: AWB invalid primit: ${responseText.slice(0, 200)}`)
  }

  console.log('Cargus: AWB creat cu succes:', awbNumber)
  return { awbNumber }
}

export async function getCargusLabel(awbNumber: string): Promise<Buffer | null> {
  try {
    const token = await getCargusToken()

    const response = await fetch(`${CARGUS_BASE_URL}/AwbDocuments/${awbNumber}/1`, {
      method: 'GET',
      headers: cargusHeaders(token),
    })

    if (!response.ok) {
      console.error(`Cargus: eticheta AWB ${awbNumber} - status ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length > 500) {
        console.log(`Cargus: eticheta AWB ${awbNumber} descărcată (${buffer.length} bytes)`)
        return buffer
      }
    }

    const text = await response.text()
    try {
      const json = JSON.parse(text)
      if (json && typeof json === 'string') {
        const buffer = Buffer.from(json, 'base64')
        if (buffer.length > 500) return buffer
      }
    } catch { /* not json */ }

    console.warn('Cargus: eticheta goală sau format necunoscut pentru AWB', awbNumber)
    return null
  } catch (error) {
    console.error('Cargus: eroare la descărcare etichetă:', error)
    return null
  }
}
