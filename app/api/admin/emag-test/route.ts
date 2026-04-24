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
  const password = process.env.EMAG_PASSWORD || ''
  const credentials = Buffer.from(`${username}:${password}`).toString('base64')

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
    passwordPreview: password ? `${password.slice(0, 3)}... (${password.length} chars)` : 'NOT SET',
    status: emagRes.status,
    body,
  })
}
