import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUser } from "@/lib/database";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const payload = getUserFromRequest(request);
  if (!payload || typeof (payload as any).wallet !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallet = (payload as any).wallet as string;

  const user = await getUser(wallet);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.premiumStatus) {
    return NextResponse.json({ premium: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const bonkThreshold = parseFloat(
    process.env.BONK_PREMIUM_THRESHOLD || process.env.PREMIUM_THRESHOLD || "0",
  );
  const nbonkThreshold = parseFloat(process.env.NBONK_PREMIUM_THRESHOLD || "0");

  if (bonkThreshold <= 0 && nbonkThreshold <= 0) {
    return NextResponse.json({ premium: false }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { protocol, host } = new URL(request.url);
    const base = `${protocol}//${host}`;

    const solanaEndpoint = `${base}/api/solana/balance?wallet=${encodeURIComponent(wallet)}`;
    const res = await fetch(solanaEndpoint, { cache: "no-store" });
    if (!res.ok) throw new Error(`Balance check failed: ${res.status}`);

    const data = await res.json();
    const tokens = data.tokens || [];

    for (const t of tokens) {
      if (t.symbol === "BONK" && bonkThreshold > 0 && t.uiAmount >= bonkThreshold) {
        return NextResponse.json({ premium: true }, { headers: { "Cache-Control": "no-store" } });
      }
      if (t.symbol === "nBONK" && nbonkThreshold > 0 && t.uiAmount >= nbonkThreshold) {
        return NextResponse.json({ premium: true }, { headers: { "Cache-Control": "no-store" } });
      }
    }

    return NextResponse.json({ premium: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to check premium status" },
      { status: 500 },
    );
  }
}
