// lib/lunarcrush.ts
// v4 LunarCrush client (topic-based posts/creators, coin snapshot & time-series)
// Adds queue rate limiting, in-flight de-dupe, cache, and 429 backoff.

import { withLcRateLimit } from "./lc-queue";

const API_BASE = "https://lunarcrush.com/api4";
const API_KEY = process.env.LUNARCRUSH_API_KEY || "";

// simple 30s cache (tune as needed)
const TTL_MS = 30_000;
const cache = new Map<string, { at: number; data: any }>();
const inflight = new Map<string, Promise<any>>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Core fetch helper (queued + cached + retries) */
export async function callLunarCrush(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  init?: RequestInit
) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, String(v));
    }
  }

  const key = url.toString();

  // cache hit
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  // coalesce concurrent identical calls
  const pending = inflight.get(key);
  if (pending) return pending;

  const job = withLcRateLimit(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(key, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 }, // disable ISR here; we already cache in memory
      });

      if (res.status === 429) {
        const ra = Number(res.headers.get("retry-after"));
        const wait = Number.isFinite(ra) ? ra * 1000 : 600 * 2 ** attempt + Math.random() * 300;
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`LunarCrush API error ${res.status}: ${body}`);
        throw new Error(`LunarCrush API request failed: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      const data = json?.data ?? json;
      cache.set(key, { at: Date.now(), data });
      return data;
    }
    throw new Error("LunarCrush API request failed: 429 (after retries)");
  });

  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

/** Normalize a coin/topic into the v4 topic format (“bonk”) */
function normalizeTopic(input: string) {
  const s = (input || "").trim();
  const core = s.startsWith("$") ? s.slice(1) : s;
  return core.toLowerCase();
}

/* =========================
   Coin snapshot & time-series
   ========================= */

/** Current market/social snapshot (array of 1) */
export async function getCoinSnapshot(symbol: string) {
  const data = await callLunarCrush(`/public/coins/${symbol.toUpperCase()}/v1`);
  return Array.isArray(data) ? data[0] : data;
}

/** Historical market/social time-series */
export async function getCoinTimeseries(
  symbol: string,
  bucket: "hour" | "day" = "hour",
  start?: string | number,
  end?: string | number
) {
  return await callLunarCrush(`/public/coins/${symbol.toUpperCase()}/time-series/v2`, {
    bucket,
    ...(start !== undefined ? { start } : {}),
    ...(end !== undefined ? { end } : {}),
  });
}

/* =========================
   Posts & influencers (topic-based in v4)
   ========================= */

/** Posts by topic (use coin symbol as topic, e.g. BONK -> "bonk") */
export async function getCoinFeeds(symbol: string, limit = 20) {
  const topic = normalizeTopic(symbol);
  // this endpoint supports limit
  return await callLunarCrush(`/public/topic/${topic}/posts/v1`, { limit });
}

/** Top creators (influencers) for a topic */
export async function getCoinInfluencers(symbol: string, limit = 12) {
  const topic = normalizeTopic(symbol);
  // this endpoint supports limit
  const data = await callLunarCrush(`/public/topic/${topic}/creators/v1`, { limit });
  return data;
}

/** Optional: posts by a specific creator if you have their network/id */
export async function getCreatorPosts(network: string, id: string, limit = 20) {
  return await callLunarCrush(`/public/creator/${network}/${id}/posts/v1`, { limit });
}

/* =========================
   “Insights” (derived from posts)
   ========================= */

export async function getCoinInsights(symbol: string, limit = 200) {
  const res = await getCoinFeeds(symbol, limit);
  const posts: any[] = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

  const hashtags = new Map<string, number>();
  const sentiment = { pos: 0, neg: 0, neu: 0 };

  for (const p of posts) {
    const text = String(p?.text ?? p?.title ?? "");
    const tags = text.match(/#\w+/g) ?? [];
    for (const t of tags) hashtags.set(t.toLowerCase(), (hashtags.get(t.toLowerCase()) || 0) + 1);

    const s = Number(p?.sentiment ?? p?.average_sentiment ?? NaN);
    if (!Number.isNaN(s)) {
      if (s > 0.1) sentiment.pos++;
      else if (s < -0.1) sentiment.neg++;
      else sentiment.neu++;
    }
  }

  const keywords = [...hashtags.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));

  return { keywords, sentiment, totalPosts: posts.length };
}

/* Back-compat exports */
export async function getFeeds(symbol: string, limit = 20) {
  return getCoinFeeds(symbol, limit);
}
export async function getInfluencers(symbol: string, limit = 12) {
  return getCoinInfluencers(symbol, limit);
}
