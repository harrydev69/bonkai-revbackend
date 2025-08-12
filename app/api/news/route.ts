import { NextResponse } from 'next/server'

// Fetch latest crypto news related to BONK and Solana using NewsAPI. You must
// provide a valid NEWSAPI_KEY in your environment. If the key is missing
// this endpoint will return an error. Results are limited to 10 articles
// sorted by most recent.

export async function GET() {
  const apiKey = process.env.NEWSAPI_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing NEWSAPI_KEY' }, { status: 500 })
  }
  try {
    const q = encodeURIComponent('BONK OR Solana')
    const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`NewsAPI responded with ${res.status}`)
    const data = await res.json()
    const articles = (data.articles || []).map((a: any) => ({
      title: a.title,
      url: a.url,
      publishedAt: a.publishedAt,
      source: a.source?.name || '',
      description: a.description,
    }))
    return NextResponse.json({ articles })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch news' }, { status: 500 })
  }
}

