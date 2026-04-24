import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function emagFetch(endpoint: string, body: object, nodeFetch: any, agent: any) {
  const credentials = Buffer.from(
    `${process.env.EMAG_USERNAME}:${process.env.EMAG_PASSWORD}`
  ).toString('base64')
  const res = await nodeFetch(`https://marketplace-api.emag.ro/api-3/${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    agent,
  } as any)
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

export async function GET() {
  const fixieUrl = process.env.FIXIE_URL
  const agent = fixieUrl ? new HttpsProxyAgent(fixieUrl) : undefined
  const { default: nodeFetch } = await import('node-fetch')

  // Get count of allowed categories
  const countRes = await emagFetch('category/count', { data: { is_allowed: 1 } }, nodeFetch, agent)
  const totalAllowed = countRes?.results?.noOfItems || '?'
  const totalPages = countRes?.results?.noOfPages || 1

  // Read all pages and collect only name + id
  const allCategories: { id: number; name: string }[] = []
  for (let page = 1; page <= Math.min(Number(totalPages), 20); page++) {
    const res = await emagFetch('category/read', {
      data: { is_allowed: 1, currentPage: page, itemsPerPage: 100 }
    }, nodeFetch, agent)
    if (res?.results) {
      for (const cat of res.results) {
        allCategories.push({ id: cat.id, name: cat.name })
      }
    }
  }

  // Filter for fashion-related
  const fashionCategories = allCategories.filter(c =>
    c.name.toLowerCase().includes('fashion') ||
    c.name.toLowerCase().includes('imbrac') ||
    c.name.toLowerCase().includes('îmbrac') ||
    c.name.toLowerCase().includes('haine') ||
    c.name.toLowerCase().includes('tricou') ||
    c.name.toLowerCase().includes('rochie') ||
    c.name.toLowerCase().includes('pantalon') ||
    c.name.toLowerCase().includes('bluza') ||
    c.name.toLowerCase().includes('bluz') ||
    c.name.toLowerCase().includes('jacheta') ||
    c.name.toLowerCase().includes('jachet') ||
    c.name.toLowerCase().includes('fusta') ||
    c.name.toLowerCase().includes('fustă')
  )

  return NextResponse.json({
    totalAllowedCategories: totalAllowed,
    totalPages,
    fashionCategories,
    allCategoryNames: allCategories.map(c => `[${c.id}] ${c.name}`),
  })
}
