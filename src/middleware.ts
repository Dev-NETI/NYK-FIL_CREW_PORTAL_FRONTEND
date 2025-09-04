import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const userCookie = request.cookies.get('user')?.value
  
  let isCrew = false
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie)
      isCrew = user.is_crew
    } catch (e) {
      console.error('Error parsing user cookie:', e)
    }
  }

  const { pathname } = request.nextUrl

  // If user is already logged in and tries to access login page
  if (token && pathname === '/login') {
    // Redirect based on role
    if (isCrew) {
      return NextResponse.redirect(new URL('/crew/home', request.url))
    } else {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // If user is not logged in and tries to access protected routes
  if (!token && (pathname.startsWith('/crew/home') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in user tries to access wrong role-based route
  if (token) {
    if (isCrew && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    if (!isCrew && pathname.startsWith('/crew/home')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Block admin users from accessing crew routes
    if (!isCrew && pathname.match(/^\/(crew|home)/)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}