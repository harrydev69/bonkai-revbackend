import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Simple per-IP token-bucket limiter (memory only).
 * Use Redis for production (e.g., Upstash) so limits work across instances.
 */
type Bucket = { tokens: number; lastRefill: number }
const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60_000             // 1 minute
const MAX_TOKENS = 60                // 60 req/min/IP
const REFILL_RATE = MAX_TOKENS / WINDOW_MS // tokens per ms

function getClientIp(req: NextRequest): string {
  // Prefer standard proxy headers set by Vercel / CDNs / proxies
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    // x-forwarded-for can be a comma-separated list -> take the first
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')
  if (real) return real
  // Some providers use these:
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  const fly = req.headers.get('fly-client-ip')
  if (fly) return fly
  // Fallback to remote address is not exposed; use a constant
  return '0.0.0.0'
}

function take(ip: string) {
  const now = Date.now()
  const b = buckets.get(ip) ?? { tokens: MAX_TOKENS, lastRefill: now }
  if (now > b.lastRefill) {
    const elapsed = now - b.lastRefill
    b.tokens = Math.min(MAX_TOKENS, b.tokens + elapsed * REFILL_RATE)
    b.lastRefill = now
  }
  if (b.tokens >= 1) {
    b.tokens -= 1
    buckets.set(ip, b)
    return { allowed: true, remaining: Math.floor(b.tokens) }
  }
  buckets.set(ip, b)
  return { allowed: false, remaining: 0 }
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Only limit API routes (adjust as needed)
  if (!path.startsWith('/api')) return NextResponse.next()
  if (path.startsWith('/api/health')) return NextResponse.next()

  const ip = getClientIp(req)
  const { allowed, remaining } = take(ip)

  const res = allowed
    ? NextResponse.next()
    : NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  res.headers.set('X-RateLimit-Limit', String(MAX_TOKENS))
  res.headers.set('X-RateLimit-Remaining', String(remaining))
  return res
}

// Apply to /api only
export const config = { matcher: ['/api/:path*'] }
