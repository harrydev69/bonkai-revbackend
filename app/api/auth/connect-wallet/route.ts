import { NextResponse } from "next/server";
import { signJwt } from "@/lib/jwt";
import { getOrCreateUser } from "@/lib/database";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function extractWallet(req: Request): Promise<string | undefined> {
  // 1) URL query param (works with POST)
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("wallet");
  if (fromQuery) return fromQuery;

  // 2) Content-Type based parsing
  const ct = (req.headers.get("content-type") || "").toLowerCase();

  // 2a) JSON
  if (ct.includes("application/json")) {
    try {
      const data = await req.json();
      if (typeof data?.wallet === "string") return data.wallet;
    } catch {/* fall through */}
  }

  // 2b) Read raw body once and try JSON or form
  try {
    const raw = await req.text();
    if (!raw) return undefined;

    // attempt JSON
    try {
      const data = JSON.parse(raw);
      if (typeof data?.wallet === "string") return data.wallet;
    } catch {
      // attempt form-encoded
      const params = new URLSearchParams(raw);
      const w = params.get("wallet");
      if (w) return w;
    }
  } catch {/* ignore */}

  return undefined;
}

export async function POST(req: Request) {
  try {
    const wallet = await extractWallet(req);
    if (!wallet) {
      // Tiny debug to help when testing from shells that munge quotes
      const ct = req.headers.get("content-type") || "";
      const probe = await req.text().catch(() => "");
      return NextResponse.json(
        { error: "Missing wallet address", _debug: { contentType: ct, rawBodyPreview: probe.slice(0, 120) } },
        { status: 400 }
      );
    }

    // (Optional) lightweight shape check
    if (wallet.length < 32 || wallet.length > 64) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    const user = await getOrCreateUser(wallet);
    const token = await signJwt({ sub: user.id, wallet });

    const res = NextResponse.json({ ok: true, user });
    res.cookies.set("bonkai_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to connect wallet" },
      { status: 500 }
    );
  }
}
