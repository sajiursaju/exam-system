// frontend/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  const path = req.nextUrl.pathname;

  // /admin-login — always allow, no token needed
  if (path === "/admin-login") {
    return NextResponse.next();
  }

  // /admin/* — require token, redirect to /admin-login
  if (path.startsWith("/admin")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin-login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // /student/* — require token, redirect to /login
  if (path.startsWith("/student")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/admin-login"],
};