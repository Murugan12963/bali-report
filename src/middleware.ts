import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /admin/* routes with Basic Authentication
  if (path.startsWith("/admin")) {
    const basicAuth = request.headers.get("authorization");

    if (!basicAuth) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
        },
      });
    }

    try {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      // Get credentials from environment variables
      const validUser = process.env.ADMIN_USERNAME || "admin";
      const validPass = process.env.ADMIN_PASSWORD || "bali2025";

      if (user !== validUser || pwd !== validPass) {
        return new NextResponse("Invalid credentials", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
          },
        });
      }
    } catch (error) {
      return new NextResponse("Invalid authorization header", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
        },
      });
    }
  }

  // Simple pass-through middleware for other routes
  return NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public files (public folder)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\..*).*)",
  ],
};
