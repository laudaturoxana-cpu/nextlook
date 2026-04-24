import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function emagFetch(endpoint: string, body: object, nodeFetch: any, agent: any) {
  const credentials = Buffer.from(
    `${process.env.EMAG_USERNAME}:${process.env.EMAG_PASSWORD}`
  ).toString('base64')
  const res = await nodeFetch(`https://marketplace-api.emag.ro/api-3/${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    agent,
  } as any)
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  const { default: nodeFetch } = await import('node-fetch')

  const catRes = await emagFetch('category/read', { data: {}, currentPage: 1, itemsPerPage: 5000 }, nodeFetch, agent)
  const all: any[] = catRes?.results || []
  const footwear = all.filter((c: any) =>
    /panto|adida|cizma|cizme|botine|botin|sandale|sandal|incalt|papuc|sneaker|boot|mocasin|balerini|espadrile|saboti|pantofi/i.test(c.name)
  )

  return NextResponse.json({ footwear })
}
