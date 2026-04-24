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

  const [vatRes, handlingRes] = await Promise.all([
    emagFetch('vat/read', { data: {} }, nodeFetch, agent),
    emagFetch('handling_time/read', { data: {} }, nodeFetch, agent),
  ])

  return NextResponse.json({
    vatRates: vatRes?.results,
    handlingTimes: handlingRes?.results,
  })
}
