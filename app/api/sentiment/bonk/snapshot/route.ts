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

    return NextResponse.json(
      { insights },
      {
        headers: {
          "Cache-Control": "public, max-age=5, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/sentiment/bonk/snapshot error:", err);
    const message = String(err?.message ?? "Snapshot failed");
    const status = /429/.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
