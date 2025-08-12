import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { addSearchHistory } from "@/lib/database";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";

  if (!query) {
    return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`CoinGecko search failed with status ${res.status}`);

    const data = await res.json();
    const results = (data.coins || []).map((coin: any) => ({
      id: coin.id,
      title: coin.name,
      description: coin.symbol,
      url: `https://www.coingecko.com/en/coins/${coin.id}`,
      source: "CoinGecko",
      timestamp: new Date().toISOString(),
      relevance: null,
      category: "coin",
      sentiment: null,
      engagement: null,
    }));

    const payload = getUserFromRequest(request);
    if (payload && typeof (payload as any).wallet === "string") {
      try {
        addSearchHistory((payload as any).wallet as string, query, category);
      } catch {
        // best-effort only
      }
    }

    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 500 });
  }
}
