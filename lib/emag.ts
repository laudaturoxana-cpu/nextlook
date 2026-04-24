import { HttpsProxyAgent } from 'https-proxy-agent'

const EMAG_BASE = 'https://marketplace-api.emag.ro/api-3'

// Fashion categories available for this seller
export const EMAG_FASHION_CATEGORIES = [
  { id: 2669, name: 'Rochii' },
  { id: 2671, name: 'Bluze dama' },
  { id: 2672, name: 'Camasi dama' },
  { id: 2673, name: 'Pantaloni dama' },
  { id: 2674, name: 'Blugi dama' },
  { id: 2675, name: 'Colanti' },
  { id: 2676, name: 'Fuste' },
  { id: 2678, name: 'Tricouri dama' },
  { id: 2679, name: 'Pulovere dama' },
  { id: 2680, name: 'Hanorace dama' },
  { id: 2681, name: 'Geci dama' },
  { id: 2683, name: 'Paltoane dama' },
  { id: 2677, name: 'Sacouri dama' },
  { id: 3785, name: 'Costume si compleuri dama' },
  { id: 3855, name: 'Salopete dama' },
  { id: 2719, name: 'Tricouri barbati' },
  { id: 3133, name: 'Bluze barbati' },
  { id: 2722, name: 'Camasi barbati' },
  { id: 2720, name: 'Pulovere barbati' },
  { id: 2721, name: 'Hanorace barbati' },
  { id: 2723, name: 'Sacouri barbati' },
  { id: 2727, name: 'Pantaloni barbati' },
  { id: 2728, name: 'Blugi barbati' },
  { id: 2729, name: 'Geci barbati' },
  { id: 2731, name: 'Paltoane barbati' },
  { id: 3784, name: 'Costume barbati' },
  { id: 1390, name: 'Pantaloni copii' },
  { id: 3216, name: 'Tricouri copii' },
  { id: 3218, name: 'Bluze copii' },
  { id: 3019, name: 'Imbracaminte plaja' },
  { id: 2593, name: 'Costume de baie dama' },
  { id: 2592, name: 'Lenjerie intima dama' },
  { id: 1819, name: 'Lenjerie intima barbati' },
] as const

async function getAgent() {
  const fixieUrl = process.env.FIXIE_URL
  if (!fixieUrl) return undefined
  return new HttpsProxyAgent(fixieUrl)
}

export async function emagFetch(endpoint: string, body: object): Promise<any> {
  const credentials = Buffer.from(
    `${process.env.EMAG_USERNAME}:${process.env.EMAG_PASSWORD}`
  ).toString('base64')

  const agent = await getAgent()
  const { default: nodeFetch } = await import('node-fetch')

  const res = await nodeFetch(`${EMAG_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + credentials,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    agent,
  } as any)

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text, status: res.status }
  }
}

export interface EmagProductPayload {
  sellerId: number        // seller's internal integer ID
  categoryId: number      // eMAG category ID
  name: string
  partNumber: string
  brand: string
  description: string
  images: string[]        // array of public image URLs
  price: number
  stock: number
}

export async function syncProductToEmag(payload: EmagProductPayload) {
  const productData = {
    id: payload.sellerId,
    category_id: payload.categoryId,
    name: payload.name,
    part_number: payload.partNumber.slice(0, 25),
    brand: payload.brand || 'OEM',
    description: payload.description || payload.name,
    images: payload.images.slice(0, 9).map((url, i) => ({
      url,
      display_order: i + 1,
    })),
    sale_price: payload.price,
    min_sale_price: Math.round(payload.price * 0.7 * 100) / 100,
    max_sale_price: Math.round(payload.price * 1.5 * 100) / 100,
    vat_id: 5,
    stock: payload.stock,
    warranty: 0,
    handling_time: 3,
    is_displayed: 1,
    availability: 1,
    status: 1,
  }

  return emagFetch('product_offer/save', { data: [productData] })
}
