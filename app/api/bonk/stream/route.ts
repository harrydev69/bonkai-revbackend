import { NextResponse } from "next/server";

export const runtime = "nodejs";           // ensure Node runtime on Vercel
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const intervalSec = Number(searchParams.get("interval") || 5);
  const intervalMs = Number.isFinite(intervalSec) && intervalSec >= 1 ? intervalSec * 1000 : 5000;

  const encoder = new TextEncoder();
  let closed = false;
  let tick: ReturnType<typeof setInterval> | null = null;
  let ping: ReturnType<typeof setInterval> | null = null;

  // Derive absolute base from the incoming request (works in dev/prod)
  const { protocol, host } = new URL(request.url);
  const base = `${protocol}//${host}`;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (tick) clearInterval(tick);
        if (ping) clearInterval(ping);
        try { controller.close(); } catch { /* already closed */ }
      };

      // Abort when client disconnects
      request.signal?.addEventListener("abort", cleanup);

      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const sendData = (data: any) => {
        safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const sendComment = (txt: string) => {
        safeEnqueue(`: ${txt}\n\n`);
      };

      const sendPrice = async () => {
        if (closed) return;
        try {
          const res = await fetch(`${base}/api/bonk/price`, { cache: "no-store" });
          if (!res.ok) throw new Error(`price ${res.status}`);
          const json = await res.json();
          sendData(json);
        } catch (e: any) {
          // keep stream alive; client keeps last good state
          sendComment(e?.message || "fetch error");
        }
      };

      // Set retry & push first payload
      safeEnqueue(`retry: 10000\n`);
      void sendPrice();

      tick = setInterval(sendPrice, intervalMs);
      ping = setInterval(() => sendComment("keepalive"), 15000);
    },
    cancel() {
      closed = true;
      if (tick) clearInterval(tick);
      if (ping) clearInterval(ping);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
