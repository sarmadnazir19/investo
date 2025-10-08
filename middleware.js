// middleware.js (place in root directory)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get authentication cookie 
  const authCookie = request.cookies.get('auth');
  let token = authCookie?.value;
  
    let isAuthenticated = !!token;
    let username = null;
    let isAdmin = false;
    let tokenType = null;
  
  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      username = decoded.username;
      isAdmin = decoded.isAdmin || username === 'StonksAdmin';
        tokenType = isAdmin ? "admin" : "user";
      } catch (error) {
        isAuthenticated = false;
        token = null;
      }
    } else {
      isAuthenticated = false;
  }
  
  // Protect /admin route 
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || tokenType !== "admin") {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }
  
  // Protect /dashboard route
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {

      return NextResponse.redirect(new URL('/', request.url));
    }
    

    return NextResponse.next();
  }
  
  // Allow all other routes
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin',
    '/admin/',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/',
    '/dashboard/:path*',
  ],
};