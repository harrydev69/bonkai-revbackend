// app/api/bonk/top10/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Row = {
  id: string;
  symbol: string;
  name: string;
  image: string; // <-- logo URL
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  sparkline_in_7d?: { price: number[] };
};

export async function GET() {
  const key = process.env.COINGECKO_API_KEY; // optional
  const headers = new Headers();
  if (key) headers.set("x-cg-pro-api-key", key);

  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("category", "letsbonk-fun-ecosystem");
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "10");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  url.searchParams.set("price_change_percentage", "1h,24h,7d");

  try {
    const res = await fetch(url.toString(), { headers, cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const j = (await res.json()) as Row[];

    // normalize a lean payload your UI can consume
    const out = j.map((r) => ({
      id: r.id,
      symbol: r.symbol?.toUpperCase(),
      name: r.name,
      logo: r.image, // <-- logo here
      price: r.current_price,
      marketCap: r.market_cap,
      volume24h: r.total_volume,
      change1h: r.price_change_percentage_1h_in_currency ?? null,
      change24h: r.price_change_percentage_24h ?? null,
      change7d: r.price_change_percentage_7d_in_currency ?? null,
    }));

    return NextResponse.json({ updatedAt: Date.now(), items: out }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json(
      { error: "failed to fetch bonkfun top10", message: e?.message || String(e) },
      { status: 502 }
    );
  }
}
