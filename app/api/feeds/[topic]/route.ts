import { NextResponse } from "next/server"
import { getFeeds, unwrapArray } from "@/lib/lunarcrush"

export async function GET(req: Request, { params }: { params: { topic: string } }) {
  const { topic } = params
  const url = new URL(req.url)
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10), 1), 200)

  try {
    const raw = await getFeeds(topic, limit)
    const items = unwrapArray(raw).slice(0, limit)
    return NextResponse.json({ items }, { status: 200 })
  } catch (err: any) {
    const status = err?.status && Number.isFinite(err.status) ? err.status : 500
    return NextResponse.json(
      { error: `feeds ${status}: ${err?.message || "failed"}` },
      { status }
    )
  }
}
