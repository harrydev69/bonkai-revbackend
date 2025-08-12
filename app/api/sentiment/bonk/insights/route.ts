// app/api/sentiment/bonk/insights/route.ts
import { NextResponse } from "next/server"
import { getCoinInsights } from "@/lib/lunarcrush"
export const dynamic = "force-dynamic"
export async function GET() {
  const insights = await getCoinInsights("bonk")
  return NextResponse.json({ insights })
}
