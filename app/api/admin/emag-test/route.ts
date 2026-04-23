import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function testEmag(username: string, password: string, agent: any, nodeFetch: any) {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64')
  const res = await nodeFetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + credentials,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: {} }),
    agent,
  } as any)
  const text = await res.text()
  let body: unknown
  try { body = JSON.parse(text) } catch { body = text }
  return { status: res.status, body }
}

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  const { default: nodeFetch } = await import('node-fetch')

  const ipRes = await nodeFetch('https://api.ipify.org?format=json', { agent } as any)
  const ipData = await ipRes.json() as { ip: string }

  const email = process.env.EMAG_USERNAME || ''
  const apiCode = process.env.EMAG_API_KEY || ''

  // Test 1: email as username, apiCode as password (current setup)
  const test1 = await testEmag(email, apiCode, agent, nodeFetch)

  // Test 2: apiCode as username, email as password
  const test2 = await testEmag(apiCode, email, agent, nodeFetch)

  // Test 3: apiCode as both username and password
  const test3 = await testEmag(apiCode, apiCode, agent, nodeFetch)

  return NextResponse.json({
    ip: ipData.ip,
    'email:apiCode': test1,
    'apiCode:email': test2,
    'apiCode:apiCode': test3,
  })
}
