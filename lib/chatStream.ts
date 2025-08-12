// lib/chatStream.ts
export type ChatMsg = { role: "system" | "user" | "assistant"; content: string }

export async function* chatStream(messages: ChatMsg[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stream: true, messages }),
  })
  if (!res.ok || !res.body) throw new Error(`chat ${res.status}`)

  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ""
  let inThink = false

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })

    let i
    while ((i = buf.indexOf("\n\n")) !== -1) {
      const chunk = buf.slice(0, i).trim()
      buf = buf.slice(i + 2)
      if (!chunk.startsWith("data:")) continue

      const payload = chunk.slice(5).trim()
      if (payload === "[DONE]") return

      try {
        const json = JSON.parse(payload)
        const delta =
          json?.choices?.[0]?.delta?.content ??
          json?.choices?.[0]?.message?.content ??
          ""
        if (!delta) continue

        // strip <think>…</think>
        let out = ""
        for (const seg of delta.split(/(<\/?think>)/g)) {
          if (seg === "<think>") { inThink = true; continue }
          if (seg === "</think>") { inThink = false; continue }
          if (!inThink) out += seg
        }
        if (out) yield out
      } catch {
        /* ignore keepalives/comments */
      }
    }
  }
}

