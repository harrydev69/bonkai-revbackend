"use client";

import { useEffect, useState } from "react";

type TokenRow = {
  id: string;
  symbol: string;
  name: string;
  price: number | null;
  change24h: number | null;
  volume: number | null;
  marketCap: number | null;
  logoUrl: string | null;
};

export default function TopTokensTable({
  ids = ["bonk", "useless"],   // <- put your CoinGecko ids here
  vs = "usd",
  perPage = 50,
}: { ids?: string[]; vs?: string; perPage?: number }) {
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams({
      vs_currency: vs,
      per_page: String(perPage),
      order: "market_cap_desc",
    });
    if (ids.length) q.set("ids", ids.join(","));

    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/tokens/top?${q.toString()}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`api ${r.status}`);
        const j = await r.json();
        setRows(j.tokens ?? []);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || "load_error");
      } finally {
        setLoading(false);
      }
    })();
  }, [ids.join(","), vs, perPage]);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading tokens…</div>;
  if (err) return <div className="p-4 text-sm text-red-500">Failed: {err}</div>;

  return (
    <div className="p-4">
      <table className="w-full text-sm">
        <thead className="text-muted-foreground">
          <tr>
            <th className="text-left py-2">Token</th>
            <th className="text-right">Price</th>
            <th className="text-right">24h</th>
            <th className="text-right">Volume</th>
            <th className="text-right">Mkt Cap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="py-2 flex items-center gap-2">
                {t.logoUrl ? (
                  <img
                    src={t.logoUrl}
                    alt={t.symbol}
                    className="h-6 w-6 rounded-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted grid place-items-center text-[10px]">
                    {(t.symbol ?? "?").slice(0, 1)}
                  </div>
                )}
                <span className="font-medium">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.symbol}</span>
              </td>
              <td className="text-right">{t.price != null ? `$${t.price.toLocaleString()}` : "—"}</td>
              <td className={`text-right ${((t.change24h ?? 0) >= 0) ? "text-green-500" : "text-red-500"}`}>
                {t.change24h != null ? `${t.change24h.toFixed(2)}%` : "—"}
              </td>
              <td className="text-right">{t.volume != null ? `$${t.volume.toLocaleString()}` : "—"}</td>
              <td className="text-right">{t.marketCap != null ? `$${t.marketCap.toLocaleString()}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
