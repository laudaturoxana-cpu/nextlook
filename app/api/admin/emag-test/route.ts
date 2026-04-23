import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  const { default: nodeFetch } = await import('node-fetch')

  const ipRes = await nodeFetch('https://api.ipify.org?format=json', { agent } as any)
  const ipData = await ipRes.json() as { ip: string }

  const username = process.env.EMAG_USERNAME || ''
  const apiKey = process.env.EMAG_API_KEY || ''
  const credentials = Buffer.from(`${username}:${apiKey}`).toString('base64')

  const emagRes = await nodeFetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + credentials,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: {} }),
    agent,
  } as any)

  const text = await emagRes.text()
  let body: unknown
  try { body = JSON.parse(text) } catch { body = text }

  return NextResponse.json({
    ip: ipData.ip,
    username,
    apiKeyPreview: apiKey ? `${apiKey.slice(0, 3)}...${apiKey.slice(-2)} (${apiKey.length} chars)` : 'NOT SET',
    status: emagRes.status,
    body,
  })
}
