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
  try { return { status: res.status, data: JSON.parse(text) } }
  catch { return { status: res.status, data: text } }
}

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  const { default: nodeFetch } = await import('node-fetch')

  // Get categories allowed for this seller
  const categories = await emagFetch('category/read', {
    data: { is_allowed: 1, itemsPerPage: 100 }
  }, nodeFetch, agent)

  return NextResponse.json(categories)
}
