import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * Hourly aggregator (for Vercel Cron).
 * Fetches /api/news for now. Extend to markets, summaries, DB/Redis writes.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const base = `${url.protocol}//${url.host}`

    const newsRes = await fetch(`${base}/api/news`, { cache: 'no-store' })
    const newsJson = newsRes.ok ? await newsRes.json() : { articles: [] }

    return NextResponse.json(
      {
        ok: true,
        timestamp: new Date().toISOString(),
        counts: { news: Array.isArray(newsJson.articles) ? newsJson.articles.length : 0 },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'cron failed' }, { status: 500 })
  }
}
