import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/auth'
import { getAlerts } from '@/lib/database'

// SSE endpoint that emits the authenticated user's alerts. It polls
// the underlying data store every few seconds and sends the full list
// of alerts as a JSON payload. In the future this can be replaced
// with a push mechanism or websockets that broadcast only changes.

export async function GET(request: Request) {
  const payload = getUserFromRequest(request)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const interval = 10 // seconds between polling cycles
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      async function sendAlerts() {
        try {
          const list = await getAlerts(payload.wallet)
          const payloadJson = JSON.stringify(list)
          controller.enqueue(encoder.encode(`data: ${payloadJson}\n\n`))
        } catch (err: any) {
          const msg = err?.message || 'error'
          controller.enqueue(encoder.encode(`event: error\ndata: ${msg}\n\n`))
        }
      }
      await sendAlerts()
      const id = setInterval(sendAlerts, interval * 1000)
      controller.signal.addEventListener('abort', () => clearInterval(id))
    },
  })
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

