/**
 * Next.js Middleware
 * Handles rate limiting, security headers, and request filtering
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting store (in-memory for single server, use Redis for distributed)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100, // More lenient for API
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Strict for auth endpoints
  },
};

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Rate limiting logic
 */
function rateLimit(
  identifier: string,
  config: { windowMs: number; maxRequests: number },
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // No record or expired
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  // Increment count
  record.count++;

  const allowed = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);

  return { allowed, remaining, resetTime: record.resetTime };
}

/**
 * Clean up expired entries periodically
 */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000,
); // Every 5 minutes

/**
 * Security headers
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers if not already set
  if (!response.headers.has("X-Content-Type-Options")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
  }
  if (!response.headers.has("X-Frame-Options")) {
    response.headers.set("X-Frame-Options", "DENY");
  }
  if (!response.headers.has("X-XSS-Protection")) {
    response.headers.set("X-XSS-Protection", "1; mode=block");
  }
  if (!response.headers.has("Referrer-Policy")) {
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  return response;
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Has file extension
  ) {
    return NextResponse.next();
  }

  // Get client identifier
  const clientIp = getClientIp(request);

  // Determine rate limit config based on path
  let config: { windowMs: number; maxRequests: number } = {
    windowMs: RATE_LIMIT_CONFIG.windowMs,
    maxRequests: RATE_LIMIT_CONFIG.maxRequests
  };
  let identifier = `default:${clientIp}`;

  if (pathname.startsWith("/api/auth")) {
    config = RATE_LIMIT_CONFIG.auth;
    identifier = `auth:${clientIp}`;
  } else if (pathname.startsWith("/api")) {
    config = RATE_LIMIT_CONFIG.api;
    identifier = `api:${clientIp}`;
  }

  // Apply rate limiting
  const { allowed, remaining, resetTime } = rateLimit(identifier, config);

  // Create response
  let response: NextResponse;

  if (!allowed) {
    // Rate limit exceeded
    response = new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
        },
      },
    );
  } else {
    // Allow request
    response = NextResponse.next();
  }

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(resetTime / 1000)),
  );

  // Add security headers
  response = addSecurityHeaders(response);

  return response;
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
