import { NextResponse } from "next/server";
import { getInfluencers } from "@/lib/lunarcrush";
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
    const raw = Number(url.searchParams.get("limit") ?? "12");
    // creators endpoint may not honor "limit"; we clamp for slicing later
    const limit = Math.max(1, Math.min(50, Number.isFinite(raw) ? raw : 12));
    const key = `influencers:BONK:${limit}`;

    // 30s server memo to smooth bursts
    const data = await cached(key, 30_000, async () => {
      let lastErr: unknown;
      for (let i = 0; i < 3; i++) {
        try {
          // fetch full creators list; slice locally
          return await getInfluencers("BONK");
        } catch (e: any) {
          lastErr = e;
          const msg = String(e?.message ?? e);
          if (msg.includes("429")) {
            await new Promise((r) => setTimeout(r, 800 * (i + 1))); // 0.8s, 1.6s, 2.4s
            continue;
          }
          break;
        }
      }
      if (lastErr) throw lastErr;
      return await getInfluencers("BONK");
    });

    const influencers = toArray(data).slice(0, limit);

    return NextResponse.json(
      { influencers },
      {
        headers: {
          "Cache-Control": "public, max-age=5, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/influencers/bonk error:", err);
    const message = String(err?.message ?? "Influencers failed");
    const status = /429/.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
