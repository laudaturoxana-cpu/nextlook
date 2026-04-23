import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function fetchViaProxy(url: string, options: Record<string, unknown> = {}) {
  const fixieUrl = process.env.FIXIE_URL
  if (!fixieUrl) return fetch(url, options as RequestInit)
  
  const agent = new HttpsProxyAgent(fixieUrl)
  // Folosim http module direct — suportat garantat in Node.js runtime
  const { default: nodeFetch } = await import('node-fetch')
  return nodeFetch(url, { ...options, agent } as any) as any
}

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL

  const ipRes = await fetchViaProxy('https://api.ipify.org?format=json')
  const ipData = await ipRes.json()

  const credentials = Buffer.from('bancueugenia4@gmail.com:nextlukt').toString('base64')
  const emagRes = await fetchViaProxy('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const emagData = await emagRes.json()

  return NextResponse.json({ 
    fixieUrl: fixieUrl ? fixieUrl.slice(0, 30) + '...' : 'NOT SET', 
    ip: ipData.ip, 
    emagStatus: emagRes.status, 
    emagResponse: emagData 
  })
}
