import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  // Clear session cookie (mirror attributes to ensure deletion across browsers)
  res.cookies.set("bonkai_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  // (optional) also clear legacy 'token' if it was ever set
  res.cookies.set("token", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
