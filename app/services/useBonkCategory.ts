// app/services/useBonkCategory.ts
import { useEffect, useState } from "react";

export type BonkfunRow = {
  id: string;
  symbol: string;
  name: string;
  logo: string;       // <-- logo URL for each token
  price: number;
  marketCap: number;
  volume24h: number;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
};

export function useBonkfunTop10() {
  const [items, setItems] = useState<BonkfunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/bonk/top10", { cache: "no-store" });
        if (!r.ok) throw new Error(`top10 ${r.status}`);
        const j = await r.json();
        if (!canceled) {
          setItems(Array.isArray(j.items) ? j.items : []);
          setUpdatedAt(j.updatedAt ?? Date.now());
        }
      } catch (e: any) {
        if (!canceled) setErr(e?.message || "fetch error");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  return { items, loading, err, updatedAt };
}
