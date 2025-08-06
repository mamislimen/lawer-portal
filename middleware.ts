import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const { pathname } = req.nextUrl

    // Admin routes: Ensure the token has the 'admin' role
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Lawyer routes: Ensure the token has the 'lawyer' role
    if (pathname.startsWith("/dashboard") && token?.role !== "lawyer") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Client routes: Ensure the token has the 'client' role
    if (pathname.startsWith("/client") && token?.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // If no token or role issues, send to unauthorized page
   // if (!token) {
     // return NextResponse.redirect(new URL("/login", req.url))
   // }

    // Rate limiting headers
    const response = NextResponse.next()
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    return response
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes (auth, home, etc.)
        if (pathname.startsWith("/auth") || pathname === "/") {
          return true
        }

        // Protected routes require authentication, return true if token exists
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)", // Match all routes except API and static files
  ],
}
