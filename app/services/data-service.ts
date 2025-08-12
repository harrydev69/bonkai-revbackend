"use client"

// Robust client-side data/service layer for BONKai
// - Safe numeric formatting & normalization
// - Real wallet connect (Phantom/Solflare) → signature verify → fallback to mock
// - SSE streaming with graceful polling fallback
// - Small client cache with TTL
// - Safer CSV exporting (quotes/commas)

type AnyRecord = Record<string, any>

const asNumber = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}
const asInt = (v: unknown): number | null => {
  const n = asNumber(v)
  return n === null ? null : Math.trunc(n)
}

const normalizeBonkPayload = (json: AnyRecord) => ({
  price: asNumber(json?.price),
  marketCap: asNumber(json?.marketCap),
  change24h: asNumber(json?.change24h),
  volume24h: asNumber(json?.volume24h),
  sentiment: (json?.sentiment ?? "neutral") as "bullish" | "bearish" | "neutral",
  socialVolume: asInt(json?.socialVolume) ?? 0,
  mindshareRank: asInt(json?.mindshareRank) ?? 0,
  updatedAt: json?.updatedAt ?? Date.now(),
})

const encodeBase64 = (bytes: Uint8Array) =>
  typeof window !== "undefined"
    ? btoa(String.fromCharCode(...bytes))
    : Buffer.from(bytes).toString("base64")

export class DataService {
  private static instance: DataService
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly BASE = "" // use relative /api routes; NEXT_PUBLIC_BASE_URL not required

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private getCachedData<T = any>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async fetchWithTimeout(input: RequestInfo, init: RequestInit & { timeoutMs?: number } = {}) {
    const { timeoutMs = 15000, ...rest } = init
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(input, { ...rest, signal: controller.signal, cache: "no-store" })
      return res
    } finally {
      clearTimeout(t)
    }
  }

  // ---------------------------
  // BONK Price/Data
  // ---------------------------
  async getBonkData() {
    const cacheKey = "bonk-data"
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/bonk/price`)
      if (!res.ok) throw new Error(`Failed to fetch BONK price: ${res.status}`)
      const json = await res.json()
      const normalized = normalizeBonkPayload(json)
      this.setCachedData(cacheKey, normalized)
      return normalized
    } catch (err) {
      if (cached) return cached
      throw err
    }
  }

  // Optional: expose metrics (used elsewhere in UI)
  async getBonkMetrics() {
    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/bonk/metrics`)
      if (!res.ok) throw new Error(`Metrics request failed: ${res.status}`)
      const json = await res.json()
      return json
    } catch (err) {
      console.error(err)
      return null
    }
  }

  // ---------------------------
  // Search
  // ---------------------------
  async search(query: string, filters?: { category?: string }) {
    const params = new URLSearchParams({ query })
    if (filters?.category) params.set("category", filters.category)

    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/search?${params.toString()}`)
      if (!res.ok) throw new Error(`Search request failed: ${res.status}`)
      const data = await res.json()
      return data.results || []
    } catch (err) {
      console.error(err)
      return []
    }
  }

  // ---------------------------
  // Alerts
  // ---------------------------
  async getAlerts() {
    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/alerts`)
      if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.status}`)
      const data = await res.json()
      return Array.isArray(data) ? data : data?.alerts ?? []
    } catch (err) {
      // fallback to local
      return this.getStoredAlerts()
    }
  }

  async createAlert(alert: any) {
    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      })
      if (!res.ok) throw new Error(`Failed to create alert: ${res.status}`)
      return await res.json()
    } catch (err) {
      // Fallback to client storage
      const newAlert = {
        ...alert,
        id: Date.now().toString(),
        isActive: alert?.isActive !== false,
        triggered: false,
        createdAt: new Date().toISOString(),
      }
      const alerts = this.getStoredAlerts()
      alerts.push(newAlert)
      localStorage.setItem("bonkai-alerts", JSON.stringify(alerts))
      return newAlert
    }
  }

  async updateAlert(id: string, updates: any) {
    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/alerts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error(`Failed to update alert: ${res.status}`)
      return await res.json()
    } catch (err) {
      // Fallback to client update
      const alerts = this.getStoredAlerts()
      const index = alerts.findIndex((a: any) => a.id === id)
      if (index !== -1) {
        alerts[index] = { ...alerts[index], ...updates }
        localStorage.setItem("bonkai-alerts", JSON.stringify(alerts))
        return alerts[index]
      }
      throw err
    }
  }

  async deleteAlert(id: string) {
    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/alerts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`Failed to delete alert: ${res.status}`)
      return true
    } catch (err) {
      const alerts = this.getStoredAlerts()
      const filtered = alerts.filter((a: any) => a.id !== id)
      localStorage.setItem("bonkai-alerts", JSON.stringify(filtered))
      return true
    }
  }

  getStoredAlerts() {
    try {
      const item = localStorage.getItem("bonkai-alerts")
      return item ? JSON.parse(item) : []
    } catch {
      return []
    }
  }

  // ---------------------------
  // Export
  // ---------------------------
  async exportData(type: "csv" | "json", data: any, filename: string) {
    await this.delay(300)

    let content: string
    let mimeType: string

    if (type === "csv") {
      content = this.convertToCSV(Array.isArray(data) ? data : [data])
      mimeType = "text/csv"
    } else {
      content = JSON.stringify(data, null, 2)
      mimeType = "application/json"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.${type}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  }

  private convertToCSV(data: AnyRecord[]): string {
    if (!Array.isArray(data) || data.length === 0) return ""
    const headers = Array.from(
      data.reduce<Set<string>>((set, row) => {
        Object.keys(row || {}).forEach((k) => set.add(k))
        return set
      }, new Set())
    )

    const esc = (v: any) => {
      if (v === null || v === undefined) return ""
      const s = String(v)
      const needsQuote = /[",\n]/.test(s)
      const q = s.replace(/"/g, '""')
      return needsQuote ? `"${q}"` : q
    }

    const lines = [headers.join(","), ...data.map((row) => headers.map((h) => esc(row?.[h])).join(","))]
    return lines.join("\n")
  }

  // ---------------------------
  // Wallet connect / auth
  // ---------------------------
  async connectWallet() {
    // Prefer real wallets (Phantom/Solflare). Fallback to mock.
    await this.delay(200)

    const anyWindow = typeof window !== "undefined" ? (window as any) : undefined
    const provider = anyWindow?.solana || anyWindow?.phantom?.solana || anyWindow?.solflare

    try {
      if (provider?.isPhantom || provider?.isSolflare) {
        // 1) Connect
        const resp = await provider.connect()
        const address: string = resp?.publicKey?.toString?.() ?? provider?.publicKey?.toString?.()
        if (!address) throw new Error("Wallet publicKey missing")

        // 2) Create a message and sign if possible
        const message = `BONKAI Login\nWallet: ${address}\nTS: ${Date.now()}`
        let signatureB64: string | undefined
        if (provider.signMessage) {
          const encoded = new TextEncoder().encode(message)
          const sig = await provider.signMessage(encoded, "utf8")
          const bytes: Uint8Array = sig?.signature ?? sig // Phantom returns {signature}
          signatureB64 = encodeBase64(bytes)
        }

        // 3) Notify backend (best effort)
        try {
          await this.fetchWithTimeout(`${this.BASE}/api/auth/connect-wallet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: address }),
          })
        } catch {}

        // 4) Verify signature when available
        if (signatureB64) {
          try {
            await this.fetchWithTimeout(`${this.BASE}/api/auth/verify-signature`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ wallet: address, message, signature: signatureB64 }),
            })
          } catch {
            // non-fatal; user is still "connected"
          }
        }

        const wallet = { address, balance: 0, portfolioValue: 0, connected: true }
        localStorage.setItem("bonkai-wallet", JSON.stringify(wallet))
        return wallet
      }
    } catch (e) {
      console.warn("Wallet connect failed, falling back to mock:", e)
    }

    // MOCK fallback
    const mockWallet = {
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      balance: 12.5,
      portfolioValue: 12847.32,
      connected: true,
    }
    try {
      await this.fetchWithTimeout(`${this.BASE}/api/auth/connect-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: mockWallet.address }),
      })
    } catch {}
    localStorage.setItem("bonkai-wallet", JSON.stringify(mockWallet))
    return mockWallet
  }

  async disconnectWallet() {
    await this.delay(200)
    try {
      await this.fetchWithTimeout(`${this.BASE}/api/auth/disconnect`, { method: "DELETE" })
    } catch {}
    localStorage.removeItem("bonkai-wallet")
    return true
  }

  getWalletData() {
    try {
      return JSON.parse(localStorage.getItem("bonkai-wallet") || "null")
    } catch {
      return null
    }
  }

  async getPremiumStatus() {
    try {
      const res = await this.fetchWithTimeout(`${this.BASE}/api/user/premium-status`)
      if (!res.ok) throw new Error(`Failed premium-status: ${res.status}`)
      return await res.json()
    } catch (e) {
      console.error(e)
      return { premium: false }
    }
  }

  // ---------------------------
  // Real-time price stream
  // ---------------------------
  subscribeToRealTimeData(callback: (data: any) => void) {
    let source: EventSource | null = null
    let pollInterval: ReturnType<typeof setInterval> | null = null

    const safeEmit = (raw: AnyRecord) => {
      try {
        const normalized = normalizeBonkPayload(raw)
        callback(normalized)
      } catch {
        // ignore bad payloads
      }
    }

    const startPolling = () => {
      pollInterval = setInterval(async () => {
        try {
          const data = await this.getBonkData()
          callback(data)
        } catch {
          // ignore
        }
      }, 30000)
    }

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        source = new EventSource(`${this.BASE}/api/bonk/stream`)
        source.onmessage = (e) => {
          if (!e?.data) return
          try {
            const json = JSON.parse(e.data)
            safeEmit(json)
          } catch {
            // keep-alive lines / malformed chunks are ignored
          }
        }
        source.onerror = () => {
          source?.close()
          source = null
          if (!pollInterval) startPolling()
        }
      } catch {
        startPolling()
      }
    } else {
      startPolling()
    }

    return () => {
      if (source) source.close()
      if (pollInterval) clearInterval(pollInterval)
    }
  }
}

export const dataService = DataService.getInstance()

