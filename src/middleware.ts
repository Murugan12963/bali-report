import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Simple pass-through middleware
  // Add any custom logic here if needed (e.g., redirects, headers)
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
