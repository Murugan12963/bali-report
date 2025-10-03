/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiter for API routes
 * Uses IP address and sliding window algorithm
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // If no entry exists, create one
  if (!entry) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: now + config.interval,
    };
  }

  // If window has expired, reset
  if (entry.resetTime < now) {
    entry.count = 1;
    entry.resetTime = now + config.interval;
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: entry.resetTime,
    };
  }

  // If within window, increment count
  entry.count++;

  // Check if exceeded limit
  if (entry.count > config.uniqueTokenPerInterval) {
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
