import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const userCookie = req.cookies.get("userData")
  const { pathname } = req.nextUrl
  // If user has cookie → always allow dashboard
  if (userCookie) {
    if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
      return NextResponse.redirect(new URL("/dashboard/add_user", req.url))
    }
    return NextResponse.next()
  }

  // No cookie → protect dashboard
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/login",
    "/auth/register",
  ],
}
