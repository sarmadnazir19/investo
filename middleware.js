import { NextResponse } from 'next/server';
import { verifyAuthToken } from './src/app/lib/auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  

  const authCookie = request.cookies.get('auth_token');
  let token = authCookie?.value;

  let isAuthenticated = false;
  let username = null;
  let isAdmin = false;
  let tokenType = null;

  if (token) {
    const decoded = verifyAuthToken(token);
    if (decoded) {
      isAuthenticated = true;
      username = decoded.username;
      isAdmin = decoded.isAdmin || username === 'StonksAdmin';
      tokenType = isAdmin ? "admin" : "user";
    }
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
  

  return NextResponse.next();
}

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