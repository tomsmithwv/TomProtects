import { RateLimitEntry } from './types';

// Per-isolate in-memory limiter (~5/min/IP). Ephemeral and per-PoP, but matches
// the brief's "simple in-memory" requirement. Revisit with KV if abuse appears.
const RATE_LIMIT_STORE = new Map<string, RateLimitEntry>();

const REQUESTS_PER_MINUTE = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const entry = RATE_LIMIT_STORE.get(ip);

  // No entry or window expired
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_STORE.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  // Check if we've exceeded the limit
  if (entry.count >= REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      message: `You've checked ${REQUESTS_PER_MINUTE} domains in the last minute. Please wait a moment before checking another.`,
    };
  }

  // Increment and allow
  entry.count++;
  return { allowed: true };
}

export function getClientIP(request: Request): string {
  // Try common headers first
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const clientIP = request.headers.get('cf-connecting-ip');
  if (clientIP) {
    return clientIP;
  }

  const remoteAddr = request.headers.get('remote-addr');
  if (remoteAddr) {
    return remoteAddr;
  }

  return 'unknown';
}
