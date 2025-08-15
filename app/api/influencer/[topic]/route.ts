import { getCoinInfluencers } from "@/lib/lunarcrush";

/**
 * GET /api/influencers/[topic]
 *
 * Generic endpoint for retrieving influencers for an arbitrary topic. The
 * `topic` parameter represents a cryptocurrency symbol or textual topic
 * recognised by LunarCrush. An optional `limit` query parameter controls
 * how many results are returned; because the underlying API does not
 * support limits natively, this endpoint always slices the result array
 * client‑side. Limits are clamped between 1 and 100 to prevent overly
 * large payloads.
 */
export async function GET(req: Request, { params }: { params: { topic: string } }) {
  const { topic } = params;
  try {
    const url = new URL(req.url);
    const rawLimit = parseInt(url.searchParams.get("limit") || "25", 10);
    const limit = Math.max(1, Math.min(100, isFinite(rawLimit) ? rawLimit : 25));

    const influencers = await getCoinInfluencers(topic, limit);
    return Response.json({ influencers });
  } catch (error: any) {
    const message = String(error?.message || "Failed to fetch influencers");
    const status = error?.status && Number.isFinite(error.status) ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}