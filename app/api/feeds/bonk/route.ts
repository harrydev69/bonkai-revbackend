// app/api/feeds/bonk/route.ts
import { NextResponse } from "next/server"
import { getFeeds } from "@/lib/lunarcrush"
export const dynamic = "force-dynamic"
export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get("limit") ?? "20")
  const feeds = await getFeeds("bonk", limit)
  return NextResponse.json({ feeds })
}
