import { NextResponse } from "next/server";
import { getCoinInsights } from "@/lib/lunarcrush";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const insights = await getCoinInsights("BONK");
    return NextResponse.json({ insights });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Insights failed" }, { status: 500 });
  }
}
