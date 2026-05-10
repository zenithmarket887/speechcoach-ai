import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    if (pathname.startsWith('/dashboard') && token?.role !== 'orthophoniste') {
      return NextResponse.redirect(new URL('/patient', req.url))
    }
    if (pathname.startsWith('/patient') && token?.role !== 'patient') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: ['/patient/:path*', '/dashboard/:path*'],
}
