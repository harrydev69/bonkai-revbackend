import { getCoinInfluencers } from "@/lib/lunarcrush";

/**
 * GET /api/influencer/bonk
 *
 * Returns the top BONK influencers (creators) from LunarCrush. An optional
 * `limit` query parameter may be supplied to reduce the number of results.
 * The limit is clamped between 1 and 100. Because the v4 creators
 * endpoint does not accept a limit query parameter, the full list is
 * fetched and sliced client‑side.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rawLimit = parseInt(url.searchParams.get("limit") || "25", 10);
    const limit = Math.max(1, Math.min(100, isFinite(rawLimit) ? rawLimit : 25));

    const influencers = await getCoinInfluencers("BONK", limit);
    return Response.json({ influencers });
  } catch (error: any) {
    const message = String(error?.message || "Failed to fetch influencers");
    return Response.json({ error: message }, { status: 500 });
  }
}
