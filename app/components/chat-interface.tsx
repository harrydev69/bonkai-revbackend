"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, TrendingUp, DollarSign, BarChart3, MessageSquare } from "lucide-react"
import { BonkData } from "../context/bonk-context"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatInterfaceProps {
  bonkData: BonkData
}

type ChatMsg = { role: "system" | "user" | "assistant"; content: string }

function stripThink(s: string) {
  let out = ""
  let inThink = false
  for (const seg of s.split(/(<\/?think>)/g)) {
    if (seg === "<think>") { inThink = true; continue }
    if (seg === "</think>") { inThink = false; continue }
    if (!inThink) out += seg
  }
  return out
}

export function ChatInterface({ bonkData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your BONK ecosystem AI assistant. Ask about prices, sentiment, trading volume, or the LetsBonk.fun ecosystem.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // use a simple scrollable div instead of ScrollArea to keep typing simple & TS-safe
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const quickActions = [
    { label: "BONK Price", icon: DollarSign, query: "What's the current BONK price and market analysis?" },
    { label: "Market Sentiment", icon: TrendingUp, query: "What's the current market sentiment for BONK?" },
    { label: "Trading Volume", icon: BarChart3, query: "Show me BONK's trading volume and activity" },
    { label: "Ecosystem Info", icon: MessageSquare, query: "Tell me about the BONK ecosystem and LetsBonk.fun" },
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // abort any stream if component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // Build API history; skip our initial greeting if it's first
  const toApiHistory = (): ChatMsg[] => {
    const offset = messages.length && messages[0].sender === "ai" ? 1 : 0
    return messages.slice(offset).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content,
    }))
  }

  const handleSendMessage = async () => {
    const text = inputValue.trim()
    if (!text) return

    // cancel any in-flight stream
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const userMessage: Message = {
      id: `${Date.now()}`,
      content: text,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    const assistantId = `${Date.now() + 1}`
    setMessages((prev) => [...prev, { id: assistantId, content: "", sender: "ai", timestamp: new Date() }])

    try {
      const history: ChatMsg[] = [...toApiHistory(), { role: "user", content: text }]

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream: true,
          messages: history,
          // you can include bonkData hints if your backend uses it
          context: {
            price: bonkData.price,
            change24h: bonkData.change24h,
            volume24h: bonkData.volume24h,
            sentiment: bonkData.sentiment,
          },
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`chat ${res.status}`)

      const ct = res.headers.get("content-type") || ""

      // Fallback: non-stream JSON
      if (!res.body || !ct.includes("text/event-stream")) {
        const json = await res.json().catch(() => null as any)
        const full = json?.choices?.[0]?.message?.content ?? ""
        const clean = stripThink(full || "")
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: clean, timestamp: new Date() } : m)),
        )
        setIsLoading(false)
        return
      }

      // Stream parse (SSE)
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ""
      let acc = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })

        let i
        while ((i = buf.indexOf("\n\n")) !== -1) {
          const frame = buf.slice(0, i).trim()
          buf = buf.slice(i + 2)

          if (!frame.startsWith("data:")) continue
          const payload = frame.slice(5).trim()
          if (payload === "[DONE]") {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, timestamp: new Date() } : m)),
            )
            setIsLoading(false)
            return
          }
          try {
            const json = JSON.parse(payload)
            const delta =
              json?.choices?.[0]?.delta?.content ??
              json?.choices?.[0]?.message?.content ??
              ""
            if (!delta) continue

            const clean = stripThink(delta)
            if (!clean) continue

            acc += clean
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
            )
          } catch {
            // ignore keepalives / non-JSON
          }
        }
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") return
      console.error("Chat error:", err)
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now() + 2}`,
          sender: "ai",
          content: "Hmm, I couldn’t reach the AI right now. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (query: string) => {
    setInputValue(query)
    setTimeout(() => handleSendMessage(), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto p-6">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/images/bonkai-mascot.png" />
              <AvatarFallback>
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                BONK AI Assistant
                <Badge variant="secondary" className="text-xs">
                  Live Data
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Real-time BONK ecosystem insights and analysis</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* scrollable area */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ai" && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/images/bonkai-mascot.png" />
                      <AvatarFallback>
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/images/bonkai-mascot.png" />
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" />
                      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t p-4">
            <p className="text-sm text-muted-foreground mb-2">Quick Actions:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.query)}
                  className="justify-start h-auto p-2"
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about BONK prices, sentiment, or ecosystem..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
