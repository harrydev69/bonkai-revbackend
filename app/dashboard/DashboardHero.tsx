// app/dashboard/DashboardHero.tsx
"use client";

import { useBonkPrice, useBonkSentiment } from "../services/useBonk";
import { fmtUSD, fmtPct, compactUSD } from "../lib/format";

export default function DashboardHero() {
  const { data: price, up, loading: loadingPrice } = useBonkPrice({ stream: true, interval: 5 });
  const { data: senti, loading: loadingSenti } = useBonkSentiment();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Price */}
      <Tile
        title="BONK Price"
        value={fmtUSD(price?.price)}
        sub={fmtPct(price?.change24h)}
        subClass={up ? "text-emerald-500" : "text-red-500"}
        foot={price?.provider ? `src: ${price.provider}` : undefined}
        loading={loadingPrice}
      />

      {/* Market Cap */}
      <Tile
        title="Market Cap"
        value={compactUSD(price?.marketCap)}
        sub={price?.sourceUpdatedAt ? `as of ${new Date(price.sourceUpdatedAt).toLocaleTimeString()}` : undefined}
        loading={loadingPrice}
      />

      {/* 24h Volume */}
      <Tile title="24h Volume" value={compactUSD(price?.volume24h)} loading={loadingPrice} />

      {/* Sentiment */}
      <Tile
        title="Sentiment"
        value={typeof senti?.score === "number" ? `${Math.round(senti.score)} / 100` : "—"}
        sub={fmtPct(senti?.change24h)}
        loading={loadingSenti}
      />
    </div>
  );
}

function Tile({
  title,
  value,
  sub,
  foot,
  loading,
  subClass,
}: {
  title: string;
  value: string;
  sub?: string;
  foot?: string;
  loading?: boolean;
  subClass?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{loading ? "…" : value}</div>
      {sub !== undefined && (
        <div className={`mt-1 text-sm ${subClass ?? "text-muted-foreground"}`}>{sub}</div>
      )}
      {foot && <div className="mt-2 text-xs text-muted-foreground">{foot}</div>}
    </div>
  );
}
