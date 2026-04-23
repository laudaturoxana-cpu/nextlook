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

  const credentials = Buffer.from(`${process.env.EMAG_USERNAME}:${process.env.EMAG_API_KEY}`).toString('base64')
  const emagRes = await nodeFetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    agent,
  } as any)
  const emagData = await emagRes.json()

  return NextResponse.json({ ip: ipData.ip, emagStatus: emagRes.status, emagResponse: emagData })
}
