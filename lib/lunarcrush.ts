// bonkai-revbackend/lib/lunarcrush.ts
//
// Helper functions for interacting with the LunarCrush v4 API.
//
// The application relies on real‑time social and market data from LunarCrush
// to populate the BONK dashboard. Previous versions of this project either
// pointed at outdated endpoints or attempted to call routes that were never
// implemented. This module centralises all API interaction logic and can be
// imported from server‑side code (API routes, cron jobs, etc.).

/*
 * Base URL for all LunarCrush requests.
 *
 * The Individual plan uses the v4 API hosted at https://lunarcrush.com/api4.
 * A trailing slash is stripped to avoid accidental double slashes when
 * concatenating paths. An optional environment variable
 * `LUNARCRUSH_API_BASE` can override the base URL during development or
 * testing. See https://lunarcrush.com/developers for details.
 */
const API_BASE = (process.env.LUNARCRUSH_API_BASE || "https://lunarcrush.com/api4").replace(/\/+$/, "");

// API key used to authenticate with LunarCrush. The key must be provided
// via the `LUNARCRUSH_API_KEY` environment variable. Without a valid key
// requests will return HTTP 401. The Individual plan allows 10 requests
// per minute and 2,000 requests per day, so consumers of this module
// should implement caching or back‑off where appropriate.
const API_KEY = process.env.LUNARCRUSH_API_KEY || "";

/**
 * Build a set of request headers for all API calls.
 *
 * Both the `Authorization` and `x-api-key` headers are set when an API
 * key is available. LunarCrush accepts either header, but setting both
 * maximises compatibility across different plans. Consumers may pass
 * additional headers via the `init` parameter of `fetchJson` – those
 * headers take precedence over the defaults defined here.
 */
function buildHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set("accept", "application/json");
  if (API_KEY) {
    // Only set the header if the caller hasn't explicitly provided it.
    if (!headers.has("authorization")) headers.set("authorization", `Bearer ${API_KEY}`);
    if (!headers.has("x-api-key")) headers.set("x-api-key", API_KEY);
  }
  return headers;
}

/**
 * Perform a fetch request against the LunarCrush API and return the parsed
 * JSON body. When the response is not OK an Error is thrown containing
 * both the HTTP status and a truncated body for easier debugging.
 */
async function fetchJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: buildHeaders(init?.headers),
  });

  if (!response.ok) {
    // Attempt to read a textual body from the error response. This is
    // particularly helpful when the server returns HTML (e.g. a 404 page)
    // which would otherwise cause JSON parsing to throw a second error.
    const text = await response.text().catch(() => "");
    const reason = text || response.statusText || "Request failed";
    const error = new Error(`LunarCrush ${response.status} on ${path} — ${reason.slice(0, 300)}`);
    (error as any).status = response.status;
    throw error;
  }

  // Some endpoints return no content on 204; return an empty object in
  // those cases so callers do not try to parse undefined.
  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

/**
 * Normalise various response shapes into a simple array. LunarCrush
 * sometimes returns an object with a `data` or `items` array property. In
 * other cases the top‑level response is already an array. This helper
 * ensures downstream consumers always receive an array.
 */
export function unwrapArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * Fetch a social feed for a given topic (symbol). The v4 feed endpoint
 * accepts an optional `limit` query parameter, but it may be ignored by
 * LunarCrush. To guarantee the caller receives the desired number of
 * items, slice the response client‑side. Consumers should implement
 * caching or back‑off when calling this function to respect rate limits.
 *
 * @param symbol Cryptocurrency symbol or topic name. Case insensitive.
 * @param limit Maximum number of posts to return. Defaults to 50.
 */
export async function getCoinFeeds(symbol: string, limit: number = 50) {
  const topic = String(symbol).toLowerCase();
  const qp = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  const raw = await fetchJson(`/public/topic/${topic}/posts/v1${qp}`);
  const items = unwrapArray(raw);
  return items.slice(0, limit);
}

/**
 * Fetch the list of top influencers (creators) for a given topic. The
 * creators endpoint does not accept a limit query parameter, so callers
 * should specify a desired number of results which will be enforced via
 * array slicing.
 *
 * @param symbol Cryptocurrency symbol or topic name. Case insensitive.
 * @param limit Maximum number of influencers to return. Defaults to 25.
 */
export async function getCoinInfluencers(symbol: string, limit: number = 25) {
  const topic = String(symbol).toLowerCase();
  const raw = await fetchJson(`/public/topic/${topic}/creators/v1`);
  const items = unwrapArray(raw);
  return items.slice(0, limit);
}

/**
 * Fetch a snapshot of coin insights (e.g. social score, galaxy score).
 *
 * @param symbol Cryptocurrency symbol. Case insensitive but normalised to
 * uppercase as required by the API.
 */
export async function getCoinInsights(symbol: string) {
  const s = String(symbol).toUpperCase();
  return await fetchJson(`/public/coins/${s}/v1`);
}

/**
 * Fetch a time series for a coin's sentiment, volume, etc. See the
 * LunarCrush documentation for valid intervals ("hour" or "day") and
 * timestamp values. Timestamps are UNIX seconds.
 */
export async function getCoinTimeseries(
  symbol: string,
  interval: "hour" | "day",
  start: number,
  end: number
) {
  const s = String(symbol).toUpperCase();
  const params = new URLSearchParams({ interval, start: String(start), end: String(end) });
  return await fetchJson(`/public/coins/${s}/time-series/v2?${params.toString()}`);
}