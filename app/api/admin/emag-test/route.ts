import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const { default: nodeFetch } = await import('node-fetch')

  const credentials = Buffer.from(
    `${process.env.EMAG_USERNAME}:${process.env.EMAG_API_KEY}`
  ).toString('base64')

  const opts = {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {} }),
  }

  // WITH proxy (Fixie fixed IP)
  const agentProxy = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  const ipProxy = await nodeFetch('https://api.ipify.org?format=json', { agent: agentProxy } as any)
  const ipProxyData = await ipProxy.json() as { ip: string }

  const resWithProxy = await nodeFetch(
    'https://marketplace-api.emag.ro/api-3/order/count',
    { ...opts, agent: agentProxy } as any
  )
  const textWithProxy = await resWithProxy.text()

  // WITHOUT proxy (random Vercel IP - not whitelisted)
  const ipNoProxy = await nodeFetch('https://api.ipify.org?format=json')
  const ipNoProxyData = await ipNoProxy.json() as { ip: string }

  const resNoProxy = await nodeFetch(
    'https://marketplace-api.emag.ro/api-3/order/count',
    opts as any
  )
  const textNoProxy = await resNoProxy.text()

  let bodyWithProxy: unknown
  let bodyNoProxy: unknown
  try { bodyWithProxy = JSON.parse(textWithProxy) } catch { bodyWithProxy = textWithProxy }
  try { bodyNoProxy = JSON.parse(textNoProxy) } catch { bodyNoProxy = textNoProxy }

  return NextResponse.json({
    withProxy: { ip: ipProxyData.ip, status: resWithProxy.status, body: bodyWithProxy },
    withoutProxy: { ip: ipNoProxyData.ip, status: resNoProxy.status, body: bodyNoProxy },
  })
}
