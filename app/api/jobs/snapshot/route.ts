import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cron endpoint to snapshot the current BONK price into the database. This
// route should be invoked by an external scheduler (e.g. Vercel Cron or
// Replit Worker) at regular intervals. When DATABASE_URL is not defined
// no action is taken. The handler always returns a JSON response with
// information about whether a snapshot was stored.

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: 'No database configured, skipping snapshot' })
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/bonk/price`)
    if (!res.ok) throw new Error(`Price fetch failed with status ${res.status}`)
    const data = await res.json()
    // Insert into PricePoint table
    const snapshot = await prisma.pricePoint.create({
      data: {
        price: data.priceUsd,
        marketCap: data.marketCap ?? null,
        volume: data.volume24h ?? null,
      },
    })
    return NextResponse.json({ message: 'Snapshot saved', id: snapshot.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Snapshot failed' }, { status: 500 })
  }
}

