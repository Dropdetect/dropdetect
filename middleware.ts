import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const isAdminArea = url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')
  if (!isAdminArea) return NextResponse.next()

  // Edge-safe: check presence of Supabase access token cookie
  const hasToken = req.cookies.get('sb-access-token')?.value
  if (!hasToken) {
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin', url)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}