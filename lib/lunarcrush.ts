// lib/lunarcrush.ts
/**
 * LunarCrush v4 helpers (server-side)
 * Base: https://lunarcrush.com/api4
 *
 * Endpoints used:
 *  - /public/topic/{topic}/posts/v1            (social feed)
 *  - /public/topic/{topic}/creators/v1         (influencers/creators)
 *  - /public/coins/{symbol}/v1                 (coin snapshot / insights)
 *  - /public/coins/{symbol}/time-series/v2     (timeseries)
 */

const API_BASE =
  process.env.LUNARCRUSH_API_BASE?.replace(/\/+$/, "") || "https://lunarcrush.com/api4";
const API_KEY = process.env.LUNARCRUSH_API_KEY || "";

function buildHeaders(init?: HeadersInit): Headers {
  const h = new Headers(init);
  h.set("accept", "application/json");

  // Send the key in both common places so you're covered regardless of plan/gateway.
  if (API_KEY) {
    if (!h.has("authorization")) h.set("authorization", `Bearer ${API_KEY}`);
    if (!h.has("x-api-key")) h.set("x-api-key", API_KEY);
  }
  return h;
}

async function fetchJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: buildHeaders(init?.headers),
  });

  // Helpful error message for debugging from UI
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const reason = text || res.statusText || "Request failed";
    const err = new Error(
      `LunarCrush ${res.status} on ${path}${text ? ` — ${reason.slice(0, 300)}` : ""}`
    );
    // Attach status so callers can do backoff on 429
    (err as any).status = res.status;
    throw err;
  }

  // Some endpoints return empty bodies on 204
  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

// Many LC endpoints sometimes wrap results in { data: [...] } or { items: [...] }
export function unwrapArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

/** Social feed for a topic (e.g. "bonk"). limit is applied client-side if the API ignores it. */
export async function getFeeds(topic: string, limit?: number) {
  const t = String(topic).toLowerCase();
  const qp = typeof limit === "number" ? `?limit=${encodeURIComponent(limit)}` : "";
  // If limit is ignored by API, your route slices after calling this.
  return await fetchJson(`/public/topic/${t}/posts/v1${qp}`);
}

/** Influencers / creators for a topic (e.g. "bonk"). v4 may not accept limit; slice in route. */
export async function getInfluencers(topic: string) {
  const t = String(topic).toLowerCase();
  return await fetchJson(`/public/topic/${t}/creators/v1`);
}

/** Coin snapshot / insights (social_score, galaxy_score, etc.). Symbol can be "BONK" or "bonk". */
export async function getCoinInsights(symbol: string) {
  const s = String(symbol).toUpperCase();
  return await fetchJson(`/public/coins/${s}/v1`);
}

/** Coin time-series for sentiment/volume etc. start/end are UNIX seconds. interval: "hour" | "day". */
export async function getCoinTimeseries(
  symbol: string,
  interval: "hour" | "day",
  start: number,
  end: number
) {
  const s = String(symbol).toUpperCase();
  const params = new URLSearchParams({
    interval,
    start: String(start),
    end: String(end),
  });
  return await fetchJson(`/public/coins/${s}/time-series/v2?${params.toString()}`);
}
