import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const credentials = Buffer.from('bancueugenia4@gmail.com:nextlukt').toString('base64')
  const r = await fetch('https://marketplace-api.emag.ro/api-3/order/count', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
  const text = await r.text()
  return NextResponse.json({ status: r.status, body: JSON.parse(text) })
}
