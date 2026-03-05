import { NextRequest, NextResponse } from 'next/server'

// Auth checking for /admin is handled in app/(admin)/admin/layout.tsx (server component)
// which uses createClient() to verify session + admin email
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
