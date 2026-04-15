// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/home",
  "/search",
  "/profile",
  "/song",
  "/playlist",
  "/playlists",
];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated via cookie
  const token = request.cookies.get("auth-token")?.value;

  // For protected routes, allow if token exists
  // Client-side will handle auth state restoration from localStorage
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    // Only redirect if definitely no way to restore auth
    // Let client try to restore from localStorage first
    return NextResponse.next();
  }

  // For admin routes, same logic - allow through to client
  if (adminRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.next();
  }

  // For auth routes, redirect to home if token exists
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
