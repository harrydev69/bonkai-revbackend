import { NextResponse } from "next/server";
import { getFeeds } from "@/lib/lunarcrush";
import { cached } from "@/lib/server-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseFeeds(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).data)) return (data as any).data;
  if (data && Array.isArray((data as any).items)) return (data as any).items;
  return [];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = Number(url.searchParams.get("limit") ?? "40");
    const limit = Math.max(1, Math.min(200, Number.isFinite(raw) ? raw : 40));
    const key = `feeds:BONK:${limit}`;

    const data = await cached(key, 15_000, async () => {
      let lastErr: unknown;
      for (let i = 0; i < 3; i++) {
        try {
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
      // If we got here due to repeated 429s/non-429 error, throw the last error
      if (lastErr) throw lastErr;
      // Fallback final attempt
      return await getFeeds("BONK", limit);
    });

    const feeds = parseFeeds(data);
    return NextResponse.json({ feeds });
  } catch (err: any) {
    console.error("GET /api/feeds/bonk error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? "Feeds failed") },
      { status: 500 }
    );
  }
}
