import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getAlerts, createAlert } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user || typeof (user as any).wallet !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const wallet = (user as any).wallet as string;

  const alerts = getAlerts(wallet);
  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user || typeof (user as any).wallet !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const wallet = (user as any).wallet as string;

  try {
    const body = await request.json();
    if (!body?.name || !body?.type) {
      return NextResponse.json({ error: "Missing required fields: name, type" }, { status: 400 });
    }

    const alert = createAlert(wallet, body);
    return NextResponse.json(alert, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create alert" },
      { status: 500 },
    );
  }
}
