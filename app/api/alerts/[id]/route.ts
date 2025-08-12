import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateAlert, deleteAlert, getAlerts, type Alert } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request);
  if (!user || typeof (user as any).wallet !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const wallet = (user as any).wallet as string;

  try {
    const updates = await request.json();
    const updated = updateAlert(wallet, params.id, updates);
    if (!updated) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update alert" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request);
  if (!user || typeof (user as any).wallet !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const wallet = (user as any).wallet as string;

  const exists = getAlerts(wallet).some((a: Alert) => a.id === params.id);
  if (!exists) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

  deleteAlert(wallet, params.id);
  return NextResponse.json({ success: true });
}
