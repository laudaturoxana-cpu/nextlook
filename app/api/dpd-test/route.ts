import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userName = process.env.DPD_USERNAME
  const password = process.env.DPD_PASSWORD
  const clientSystemId = process.env.DPD_CLIENT_ID

  // Test DPD location API
  try {
    const body: Record<string, unknown> = {
      userName,
      password,
      countryId: 642,
      name: 'Brasov',
    }

    if (clientSystemId) {
      body.clientSystemId = Number(clientSystemId)
    }

    const response = await fetch('https://api.dpd.ro/v1/location/site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json({
      envVarsPresent: {
        DPD_USERNAME: !!userName,
        DPD_PASSWORD: !!password,
        DPD_CLIENT_ID: !!clientSystemId,
      },
      requestBody: { ...body, password: '***' },
      dpdResponse: data,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      envVarsPresent: {
        DPD_USERNAME: !!userName,
        DPD_PASSWORD: !!password,
        DPD_CLIENT_ID: !!clientSystemId,
      },
    })
  }
}
