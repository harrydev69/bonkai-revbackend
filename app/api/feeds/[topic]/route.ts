import { getCoinFeeds } from "@/lib/lunarcrush";

/**
 * GET /api/feeds/[topic]
 *
 * Generic feed endpoint for any supported topic. The `topic` parameter
 * represents a cryptocurrency symbol or textual topic name. An optional
 * `limit` query parameter controls how many results are returned. Limits
 * are clamped between 1 and 200 to protect the server and respect the
 * LunarCrush plan quotas. Results are always sliced client‑side.
 */
export async function GET(req: Request, { params }: { params: { topic: string } }) {
  const { topic } = params;
  try {
    const url = new URL(req.url);
    const rawLimit = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.max(1, Math.min(200, isFinite(rawLimit) ? rawLimit : 50));

    const feeds = await getCoinFeeds(topic, limit);
    return Response.json({ feeds });
  } catch (error: any) {
    const message = String(error?.message || "Failed to fetch feeds");
    // If the underlying error exposes a status code (e.g. 429) surface it
    const status = error?.status && Number.isFinite(error.status) ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}