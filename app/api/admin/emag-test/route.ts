import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function call(url: string, username: string, password: string, agent: any, nodeFetch: any, body?: object) {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64')
  const res = await nodeFetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    agent,
  } as any)
  const text = await res.text()
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch { parsed = text }
  return { status: res.status, body: parsed }
}

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  const { default: nodeFetch } = await import('node-fetch')

  const ipRes = await nodeFetch('https://api.ipify.org?format=json', { agent } as any)
  const ipData = await ipRes.json() as { ip: string }

  const email = process.env.EMAG_USERNAME || ''       // bancueugenia4@gmail.com
  const apiCode = process.env.EMAG_API_KEY || ''      // nextlukt
  // Username as shown in eMAG panel "Utilizator" column
  const panelUser = email.replace('@', '_').replace(/\./g, '_')  // bancueugenia4_gmail_com

  const BASE = 'https://marketplace-api.emag.ro/api-3'

  const results = {
    ip: ipData.ip,
    // Standard: email + apiCode (current setup)
    A_email_apiCode_orderCount: await call(`${BASE}/order/count`, email, apiCode, agent, nodeFetch, { data: {} }),
    // Panel username format
    B_panelUser_apiCode: await call(`${BASE}/order/count`, panelUser, apiCode, agent, nodeFetch, { data: {} }),
    // product_offer/count (different resource)
    C_email_apiCode_productCount: await call(`${BASE}/product_offer/count`, email, apiCode, agent, nodeFetch, { data: {} }),
    // category/read (public-ish endpoint)
    D_email_apiCode_categoryRead: await call(`${BASE}/category/read`, email, apiCode, agent, nodeFetch, { data: { currentPage: 1, itemsPerPage: 1 } }),
  }

  return NextResponse.json(results)
}
