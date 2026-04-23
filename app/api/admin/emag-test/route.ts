import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const ipRes = await fetch('https://api.ipify.org?format=json')
  const ipData = await ipRes.json() as { ip: string }

  const credentials = Buffer.from(`${process.env.EMAG_USERNAME}:${process.env.EMAG_API_KEY}`).toString('base64')
  const emagRes = await fetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const emagData = await emagRes.json()

  return NextResponse.json({ ip: ipData.ip, emagStatus: emagRes.status, emagResponse: emagData })
}
