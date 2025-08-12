// app/api/sentiment/bonk/timeseries/route.ts
import { NextResponse } from "next/server"
import { getCoinTimeseries } from "@/lib/lunarcrush"
export const dynamic = "force-dynamic"
export async function GET(req: Request) {
  const url = new URL(req.url)
  const interval = url.searchParams.get("interval") ?? "hour"
  const points   = Number(url.searchParams.get("points") ?? "24")
  const series   = await getCoinTimeseries("bonk", interval, points)
  return NextResponse.json({ timeseries: series })
}
