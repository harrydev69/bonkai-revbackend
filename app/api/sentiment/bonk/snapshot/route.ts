// app/api/sentiment/bonk/snapshot/route.ts
import { NextResponse } from "next/server"
import { getCoinSnapshot } from "@/lib/lunarcrush"
export const dynamic = "force-dynamic"
export async function GET() {
  const snapshot = await getCoinSnapshot("bonk")
  return NextResponse.json({ snapshot })
}
