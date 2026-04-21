import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  
  // Afla IP-ul nostru prin proxy
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  
  const ipRes = await fetch('https://api.ipify.org?format=json', { ...(agent ? { agent } as any : {}) })
  const ipData = await ipRes.json()

  // Testeaza eMAG API prin proxy
  const credentials = Buffer.from('bancueugenia4@gmail.com:nextlukt').toString('base64')
  const emagRes = await fetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    ...(agent ? { agent } as any : {})
  })
  const emagData = await emagRes.json()

  return NextResponse.json({ fixieUrl: fixieUrl ? 'SET' : 'NOT SET', ip: ipData.ip, emagStatus: emagRes.status, emagResponse: emagData })
}
