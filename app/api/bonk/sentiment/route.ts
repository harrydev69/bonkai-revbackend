import { NextResponse } from "next/server";

const BASE = process.env.LUNARCRUSH_API_BASE || "https://lunarcrush.com/api4";
const KEY = process.env.LUNARCRUSH_API_KEY;

type Sentiment = {
  score: number;        // normalize to 0..100 if you prefer
  change24h: number;    // percent or delta (adjust UI)
  mentions24h: number;
  lastUpdated: string;
  source: "lunarcrush";
};

export async function GET() {
  if (!KEY) {
    return NextResponse.json(
      { score: 50, change24h: 0, mentions24h: 0, lastUpdated: new Date().toISOString(), source: "lunarcrush" },
      { status: 200 },
    );
  }

  try {
    // Adjust to the exact LC endpoint you’re entitled to; this is a common pattern.
    const r = await fetch(`${BASE}/sentiment?symbol=BONK`, {
      headers: { Authorization: `Bearer ${KEY}` },
      next: { revalidate: 30 },
    });
    if (!r.ok) throw new Error("LC not ok");
    const j = await r.json();

    // Map cautiously — tweak once you confirm field names in your plan.
    const score = Number(j?.data?.score ?? 50);
    const change24h = Number(j?.data?.delta24h ?? 0);
    const mentions24h = Number(j?.data?.mentions24h ?? 0);

    const out: Sentiment = {
      score,
      change24h,
      mentions24h,
      lastUpdated: new Date().toISOString(),
      source: "lunarcrush",
    };
    return NextResponse.json(out);
  } catch {
    return NextResponse.json(
      { score: 50, change24h: 0, mentions24h: 0, lastUpdated: new Date().toISOString(), source: "lunarcrush" },
      { status: 200 },
    );
  }
}
