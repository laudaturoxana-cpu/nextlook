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

  // Try order/count with proper body format {"data": {}}
  const emagRes = await nodeFetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + credentials,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: {} }),
    agent,
  } as any)

  const rawText = await emagRes.text()
  let emagData: unknown
  try {
    emagData = JSON.parse(rawText)
  } catch {
    emagData = rawText
  }

  // Also try category/count (simpler endpoint)
  const catRes = await nodeFetch('https://marketplace-api.emag.ro/api-3/category/count', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + credentials,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: {} }),
    agent,
  } as any)

  const catText = await catRes.text()
  let catData: unknown
  try {
    catData = JSON.parse(catText)
  } catch {
    catData = catText
  }

  return NextResponse.json({
    proxyUsed: !!fixieUrl,
    ip: ipData.ip,
    usernameUsed: username,
    orderCount: { status: emagRes.status, body: emagData },
    categoryCount: { status: catRes.status, body: catData },
  })
}
