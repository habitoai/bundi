import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/auth',
    '/auth/(.*)',  // Allow all routes under /auth
    '/api/clerk-webhook',
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    new RegExp(`^${route}$`).test(request.nextUrl.pathname)
  );
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for the Clerk session token in the cookies
  const hasClerkSession = request.cookies.has('__clerk_db_jwt');
  
  // If not authenticated, redirect to auth page
  if (!hasClerkSession) {
    const authUrl = new URL('/auth', request.url);
    return NextResponse.redirect(authUrl);
  }
  
  // User is authenticated, allow access to protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except for static assets
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
