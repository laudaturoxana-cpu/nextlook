import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

export const dynamic = 'force-dynamic'

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined

  const ipRes = await fetch('https://api.ipify.org?format=json', { agent })
  const ipData = await ipRes.json() as { ip: string }

  const credentials = Buffer.from('bancueugenia4@gmail.com:nextlukt').toString('base64')
  const emagRes = await fetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    agent,
  })
  const emagData = await emagRes.json()

  return NextResponse.json({ fixieUrl: fixieUrl ? 'SET' : 'NOT SET', ip: ipData.ip, emagStatus: emagRes.status, emagResponse: emagData })
}
