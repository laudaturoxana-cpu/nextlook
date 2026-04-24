import { HttpsProxyAgent } from 'https-proxy-agent'

const EMAG_BASE = 'https://marketplace-api.emag.ro/api-3'

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
    stock: [{ warehouse_id: 1, value: payload.stock }],
    warranty: 0,
    handling_time: [{ warehouse_id: 1, value: 3 }],
    is_displayed: 1,
    availability: 1,
    status: 1,
  }

  return emagFetch('product_offer/save', { data: [productData] })
}
