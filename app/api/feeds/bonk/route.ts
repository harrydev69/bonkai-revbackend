import { NextResponse } from "next/server";
import { getFeeds } from "@/lib/lunarcrush";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).data)) return (data as any).data;
  if (data && Array.isArray((data as any).items)) return (data as any).items;
  return [];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = Number(url.searchParams.get("limit") ?? "40");
    // keep it sane; LC v4 may not honor server-side "limit" anyway
    const limit = Math.max(1, Math.min(200, Number.isFinite(raw) ? raw : 40));
    const cacheKey = `feeds:BONK:${limit}`;

    // 15s server-side memo to smooth bursts
    const data = await cached(cacheKey, 15_000, async () => {
      let lastErr: unknown;
      for (let i = 0; i < 3; i++) {
        try {
          // lib will not pass limit to LC (topic endpoint), it slices locally
          return await getFeeds("BONK", limit);
        } catch (e: any) {
          lastErr = e;
          const msg = String(e?.message ?? e);
          if (msg.includes("429")) {
            // gentle backoff: 0.8s, 1.6s, 2.4s
            await new Promise((r) => setTimeout(r, 800 * (i + 1)));
            continue;
          }
          break; // non-429 -> stop retrying
        }
      }
      if (lastErr) throw lastErr;
      // final attempt
      return await getFeeds("BONK", limit);
    });

    const feeds = toArray(data).slice(0, limit);

    return NextResponse.json(
      { feeds },
      {
        // small client/edge cache helps cut duplicate hits from multiple components
        headers: {
          // allow CDN to cache briefly while we already memoize on server
          "Cache-Control": "public, max-age=5, s-maxage=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/feeds/bonk error:", err);
    const message = String(err?.message ?? "Feeds failed");

    // If we bubbled a 429 from LC, surface a softer error to the client
    const status = /429/.test(message) ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
