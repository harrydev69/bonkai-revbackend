// app/api/influencers/bonk/route.ts
import { NextResponse } from "next/server"
import { getInfluencers } from "@/lib/lunarcrush"
export const dynamic = "force-dynamic"
export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get("limit") ?? "10")
  const influencers = await getInfluencers("bonk", limit)
  return NextResponse.json({ influencers })
}
