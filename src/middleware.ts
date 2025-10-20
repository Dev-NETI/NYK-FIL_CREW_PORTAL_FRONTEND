import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const userCookie = request.cookies.get('user')?.value
  
  let isCrew = false
  let user = null
  
  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
      isCrew = Boolean(user.is_crew)
    } catch (e) {
      console.error('Error parsing user cookie:', e)
    }
  }

  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is already logged in and tries to access login page
  if (token && pathname === '/login') {
    // Redirect based on role
    if (isCrew) {
      return NextResponse.redirect(new URL('/crew/home', request.url))
    } else {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // If user is not authenticated and trying to access protected routes
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, handle role-based access control
  if (token && user) {
    // Redirect to appropriate home page if accessing root
    if (pathname === '/') {
      if (isCrew) {
        return NextResponse.redirect(new URL('/crew/home', request.url))
      } else {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    // Block crew members from accessing admin routes
    if (isCrew && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/crew/home', request.url))
    }

    // Block admin users from accessing crew routes
    if (!isCrew && (pathname.startsWith('/crew') || pathname === '/home')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    // Check crew profile access - crew members can only access their own profile
    const profileMatch = pathname.match(/^\/crew\/profile\/(.+)$/)
    if (profileMatch && isCrew) {
      const requestedCrewId = profileMatch[1]
      // Allow access only if accessing their own profile
      if (user.profile?.crew_id !== requestedCrewId) {
        return NextResponse.redirect(new URL('/crew/home', request.url))
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