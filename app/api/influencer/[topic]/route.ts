import { NextResponse } from "next/server"
import { getInfluencers, unwrapArray } from "@/lib/lunarcrush"

/**
 * GET /api/influencers/[topic]?limit=25
 */
export async function GET(req: Request, { params }: { params: { topic: string } }) {
  const { topic } = params
  const url = new URL(req.url)
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "25", 10), 1), 100)

  try {
    const raw = await getInfluencers(topic) // hits https://lunarcrush.com/api4/public/topic/{topic}/creators/v1
    const items = unwrapArray(raw).slice(0, limit)
    return NextResponse.json({ items }, { status: 200 })
  } catch (err: any) {
    const status = err?.status && Number.isFinite(err.status) ? err.status : 500
    return NextResponse.json(
      { error: `influencers ${status}: ${err?.message || "failed"}` },
      { status }
    )
  }
}
