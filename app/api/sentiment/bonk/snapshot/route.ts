import { NextResponse } from "next/server";
import { getCoinInsights } from "@/lib/lunarcrush";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const insights = await cached("insights:BONK", 60_000, async () => {
      let lastErr: unknown;
      for (let i = 0; i < 3; i++) {
        try {
          return await getCoinInsights("bonk");
        } catch (e: any) {
          lastErr = e;
          const msg = String(e?.message ?? e);
          if (msg.includes("429")) {
            await new Promise((r) => setTimeout(r, 800 * (i + 1)));
            continue;
          }
          break;
        }
      }
      if (lastErr) throw lastErr;
      return await getCoinInsights("bonk");
    });

    return NextResponse.json({ insights });
  } catch (err: any) {
    console.error("GET /api/sentiment/bonk/snapshot error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? "Snapshot failed") },
      { status: 500 }
    );
  }
}
