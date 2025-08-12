import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/auth'
import { getUser } from '@/lib/database'

// Returns the authenticated user's profile. Requires a valid JWT token either
// in the Authorization header or the `token` cookie. If the user cannot be
// authenticated, a 401 error is returned.

export async function GET(request: Request) {
  const payload = getUserFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = getUser(payload.wallet)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  return NextResponse.json({ user })
}

