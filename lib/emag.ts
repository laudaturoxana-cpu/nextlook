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

function toEmagSize(size: string): string {
  if (/\s+[A-Z]/i.test(size)) return size
  if (/^\d+(\.\d+)?$/.test(size.trim())) return `${size.trim()} EU`
  return size
}

export function isValidEan13(ean: string): boolean {
  if (!/^\d{13}$/.test(ean)) return false
  const digits = ean.split('').map(Number)
  const check = digits.slice(0, 12).reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 1 : 3), 0)
  return (10 - (check % 10)) % 10 === digits[12]
}

export interface EmagProductPayload {
  sellerId: number
  categoryId: number
  name: string
  partNumber: string
  brand: string
  description: string
  images: string[]
  price: number
  stock: number
  ean?: string | null
  // per-size data: sizes + optional EAN and stock per size
  sizes?: string[]
  sizeEans?: Record<string, string>   // e.g. { "37": "4002335800962" }
  sizeStocks?: Record<string, number> // e.g. { "37": 2, "38": 1 }
}

export async function syncProductToEmag(payload: EmagProductPayload) {
  const base = {
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
    warranty: 0,
    handling_time: [{ warehouse_id: 1, value: 3 }],
    is_displayed: 1,
    availability: [{ warehouse_id: 1, value: 1 }],
    status: 1,
  }

  // No sizes — send a single offer
  if (!payload.sizes || payload.sizes.length === 0) {
    return emagFetch('product_offer/save', {
      data: [{
        ...base,
        id: payload.sellerId,
        ...(payload.ean && isValidEan13(payload.ean) ? { ean: [payload.ean] } : {}),
        stock: [{ warehouse_id: 1, value: payload.stock }],
      }],
    })
  }

  // One separate offer per size — eMAG requires this
  const offers = payload.sizes.map((size, i) => {
    const sizeEan = payload.sizeEans?.[size]
    const sizeStock = payload.sizeStocks?.[size] ?? Math.floor(payload.stock / payload.sizes!.length)
    return {
      ...base,
      // unique seller ID per size: base * 100 + index+1 (max 8 digits)
      id: payload.sellerId * 10 + i,
      ...(sizeEan && isValidEan13(sizeEan) ? { ean: [sizeEan] } : {}),
      stock: [{ warehouse_id: 1, value: sizeStock }],
      characteristics: [{ id: 6506, value: toEmagSize(size) }],
    }
  })

  return emagFetch('product_offer/save', { data: offers })
}
