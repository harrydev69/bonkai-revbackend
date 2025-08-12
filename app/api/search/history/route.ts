import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/auth'
import { addSearchHistory, getSearchHistory } from '@/lib/database'

// Manage search history for the authenticated user. POST adds a new entry,
// GET returns all search entries. In this simple implementation search
// history is stored in memory and is not persisted across server restarts.

export async function GET(request: Request) {
  const payload = getUserFromRequest(request)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const history = getSearchHistory(payload.wallet)
  return NextResponse.json({ history })
}

export async function POST(request: Request) {
  const payload = getUserFromRequest(request)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const query: string | undefined = body?.query
    const category: string = body?.category || ''
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }
    const entry = addSearchHistory(payload.wallet, query, category)
    return NextResponse.json(entry)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add search entry' }, { status: 500 })
  }
}

