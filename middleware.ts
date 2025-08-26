// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define roles
type Role = 'CLIENT' | 'LAWYER' | 'ADMIN';

// Protect paths with role-based access
const roleProtectedPaths: Record<string, Role[]> = {
  '/client': ['CLIENT'],
  '/dashboard': ['LAWYER', 'ADMIN'],
  '/dashboard/documents': ['LAWYER', 'ADMIN'],
  '/admin': ['ADMIN'],
};

// Secret for JWT from .env
const SECRET = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Skip static files and public folder
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({ req, secret: SECRET });

  if (!token) {
    // Not authenticated, redirect to sign-in
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }

  const userRole = (token.role || '').toUpperCase() as Role;

  // Check role-based access
  for (const path in roleProtectedPaths) {
    if (url.pathname.startsWith(path)) {
      if (!roleProtectedPaths[path].includes(userRole)) {
        url.pathname = '/unauthorized'; // Or show a 403 page
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

// Apply middleware to all routes except API
export const config = {
  matcher: [
    '/client/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
