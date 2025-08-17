import { NextResponse } from "next/server";
import { getCoinTimeseries } from "@/lib/lunarcrush";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bucket = (url.searchParams.get("interval") as "hour" | "day") ?? "hour";

    const rawPoints = Number(url.searchParams.get("points") ?? "24");
    // Clamp points (keep API light and within rate caps)
    const points = Number.isFinite(rawPoints)
      ? Math.max(6, Math.min(bucket === "day" ? 90 : 168, rawPoints))
      : 24;

    const now = Math.floor(Date.now() / 1000);
    const secondsPer = bucket === "day" ? 86_400 : 3_600;
    const start = now - points * secondsPer;
    const end = now;

    const key = `timeseries:BONK:${bucket}:${points}`;

    const series = await cached(key, 60_000, async () => {
      let lastErr: unknown;
      for (let i = 0; i < 3; i++) {
        try {
          return await getCoinTimeseries("BONK", bucket, start, end);
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
      return await getCoinTimeseries("BONK", bucket, start, end);
    });

    return NextResponse.json(
      { timeseries: series },
      {
        headers: {
          "Cache-Control": "public, max-age=5, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/sentiment/bonk/timeseries error:", err);
    const message = String(err?.message ?? "Timeseries failed");
    const status = /429/.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
