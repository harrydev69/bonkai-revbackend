import { NextResponse } from "next/server";

export const runtime = "nodejs";           // ensure Node runtime on Vercel
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const JATEVO_URL = "https://inference.jatevo.id/v1/chat/completions";
const DEFAULT_MODEL = process.env.JATEVO_MODEL || "deepseek-ai/DeepSeek-R1-0528";
const BONKAI_SYSTEM =
  "You are BONKai, a Solana/BONK-focused assistant. Be concise, avoid financial advice, and keep responses specific to BONK and the LetsBonk.fun ecosystem. If on-chain or market data is requested, clarify it’s approximate and depends on latest fetch.";

export async function POST(req: Request) {
  const apiKey = process.env.JATEVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing JATEVO_API_KEY" }, { status: 500 });
  }

  let body: {
    messages?: Msg[];
    stream?: boolean;
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    model?: string;
    stop?: string[];
    max_tokens?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    messages = [],
    stream = true,
    temperature = 0.7,
    top_p = 0.9,
    presence_penalty = 0,
    frequency_penalty = 0,
    model = DEFAULT_MODEL,
    stop = [],
    max_tokens = 1000,
  } = body || {};

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
  }

  const finalMessages: Msg[] =
    messages.length && messages[0].role === "system"
      ? messages
      : [{ role: "system", content: BONKAI_SYSTEM }, ...messages];

  const upstreamPayload = {
    model,
    messages: finalMessages,
    stop,
    stream,
    stream_options: { include_usage: true, continuous_usage_stats: true },
    top_p,
    max_tokens,
    temperature,
    presence_penalty,
    frequency_penalty,
  };

  const upstream = await fetch(JATEVO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": stream ? "text/event-stream" : "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(upstreamPayload),
    cache: "no-store",
  });

  // Non-stream mode — return JSON body
  if (!stream) {
    const text = await upstream.text().catch(() => "");
    const status = upstream.ok ? 200 : upstream.status || 502;
    try {
      return NextResponse.json(JSON.parse(text), {
        status,
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      return new NextResponse(text, {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }
  }

  // Stream mode — pass through SSE unchanged
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json({ error: "Upstream error", detail }, { status: upstream.status || 502 });
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = upstream.body.getReader();

  (async () => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        await writer.write(value);
      }
    } catch {
      // ignore
    } finally {
      try { await writer.close(); } catch {}
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
