import { NextResponse, type NextRequest } from "next/server";

// Quick gate: no login cookie means go to /login.
// The backend still checks every request, and the page shell checks the role.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("token")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/student/:path*"] };
