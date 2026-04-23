import { NextResponse } from 'next/server'
import { ProxyAgent, fetch as undiciFetch } from 'undici'

export const dynamic = 'force-dynamic'

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const dispatcher = fixieUrl ? new ProxyAgent(fixieUrl) : undefined

  const ipRes = await undiciFetch('https://api.ipify.org?format=json', { dispatcher } as any)
  const ipData = await ipRes.json() as { ip: string }

  const credentials = Buffer.from('bancueugenia4@gmail.com:nextlukt').toString('base64')
  const emagRes = await undiciFetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    dispatcher,
  } as any)
  const emagData = await emagRes.json()

  return NextResponse.json({ fixieUrl: fixieUrl ? 'SET' : 'NOT SET', ip: ipData.ip, emagStatus: emagRes.status, emagResponse: emagData })
}
