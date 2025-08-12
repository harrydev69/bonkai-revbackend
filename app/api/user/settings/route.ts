import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateUserSettings } from "@/lib/database";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function PUT(request: Request) {
  const payload = getUserFromRequest(request);
  if (!payload || typeof (payload as any).wallet !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const wallet = (payload as any).wallet as string;

  try {
    const body = await request.json();
    const user = updateUserSettings(wallet, body);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(
      { settings: user.settings },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update settings" },
      { status: 500 },
    );
  }
}
