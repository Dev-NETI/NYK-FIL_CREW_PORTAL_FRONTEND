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
  if (!token && (pathname.startsWith('/crew/home') || pathname.startsWith('/admin') || pathname.startsWith('/crew/profile'))) {
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
    
    // Check crew profile access - crew members can only access their own profile
    const profileMatch = pathname.match(/^\/crew\/profile\/(.+)$/)
    if (profileMatch && userCookie) {
      try {
        const user = JSON.parse(userCookie)
        const requestedCrewId = profileMatch[1]
        // Allow access if user is admin or accessing their own profile
        if (user.is_crew === 1 && user.crew_id !== requestedCrewId) {
          return NextResponse.redirect(new URL('/crew/home', request.url))
        }
      } catch (e) {
        console.error('Error checking profile access:', e)
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}