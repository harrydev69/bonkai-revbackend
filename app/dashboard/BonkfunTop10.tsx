"use client";

import Image from "next/image";
import { useBonkfunTop10 } from "../services/useBonkCategory";
import { compactUSD, fmtUSD, fmtPct } from "../lib/format";

export default function BonkfunTop10() {
  const { items, loading, updatedAt } = useBonkfunTop10();

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Let’s BONK.fun — Top 10</h3>
        <div className="text-xs text-muted-foreground">
          {updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {(loading ? Array.from({ length: 6 }) : items).map((row: any, i: number) => (
          <div key={row?.id ?? i} className="flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-3">
              {/* Logo */}
              {row?.logo ? (
                <Image
                  src={row.logo}
                  alt={row?.symbol ?? "token"}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-muted" />
              )}

              <div>
                <div className="text-sm font-medium">
                  {row?.name ?? "—"}{" "}
                  <span className="text-xs text-muted-foreground">{row?.symbol ?? ""}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {row ? fmtUSD(row.price) : "…"} · {row ? compactUSD(row.marketCap) : "…"}
                </div>
              </div>
            </div>

            <div className={`text-sm ${row?.change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {row ? fmtPct(row.change24h) : "…"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
