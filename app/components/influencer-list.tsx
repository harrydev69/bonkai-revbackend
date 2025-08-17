"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Users,
  ExternalLink,
} from "lucide-react";

type Sentiment = "bullish" | "bearish" | "neutral";

type Influencer = {
  creator_id?: string;
  creator_name?: string;
  creator_avatar?: string;
  creator_followers?: number;
  creator_rank?: number;
  interactions_24h?: number;
};

function labelFromSentiment(n?: number): Sentiment {
  if (typeof n !== "number" || Number.isNaN(n)) return "neutral";
  // support both -1..1 and 0..100 scales
  const v = Math.abs(n) <= 1.2 ? n : (n - 50) / 50;
  if (v > 0.1) return "bullish";
  if (v < -0.1) return "bearish";
  return "neutral";
}
function sentimentBadgeVariant(s: Sentiment) {
  return s === "bullish"
    ? "default"
    : s === "bearish"
    ? "destructive"
    : "secondary";
}

type SortKey = "impact" | "followers";
const sorters: Record<SortKey, (a: any, b: any) => number> = {
  impact: (a, b) => (b.impact ?? 0) - (a.impact ?? 0),
  followers: (a, b) => (b.followers ?? 0) - (a.followers ?? 0),
};

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).influencers))
    return (data as any).influencers;
  if (data && Array.isArray((data as any).data)) return (data as any).data;
  if (data && Array.isArray((data as any).items)) return (data as any).items;
  return [];
}

function dedupeByKey<T extends Record<string, any>>(
  arr: T[],
  pick: (x: T, i: number) => string
) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const k = pick(arr[i], i);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(arr[i]);
    }
  }
  return out;
}

export default function InfluencerList({ limit = 20 }: { limit?: number }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("impact");

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["influencers", "bonk", limit],
    queryFn: async () => {
      const res = await fetch(`/api/influencer/bonk?limit=${limit}`, {
        cache: "force-cache", // Cache the response
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`influencers ${res.status}: ${body || res.statusText}`);
      }
      const j = await res.json().catch(() => ({}));
      const arr = toArray(j);
      // de-dupe by (id || handle || username)
      const deduped = dedupeByKey(arr, (x, i) =>
        String(x.creator_id ?? `idx:${i}`)
      );
      return deduped;
    },
    staleTime: Infinity, // Data is never stale
  });

  const rows = useMemo(() => {
    const mapped = (rawData || []).map((i, idx) => {
      const handle = i.creator_name || `user_${idx}`;
      const normHandle = handle.startsWith("@") ? handle : `@${handle}`;
      const name = i.creator_name || handle.replace(/^@/, "");
      const followers = Number(i.creator_followers ?? 0);
      const impact = Number(i.interactions_24h ?? 0);
      const avatar = i.creator_avatar || "";
      const sentimentNum = 0; // API does not provide sentiment
      const sentiment = labelFromSentiment(sentimentNum);
      const url = `https://twitter.com/${handle.replace(/^@/, "")}`;

      return {
        id: i.creator_id ?? `${idx}`,
        name,
        handle: normHandle,
        followers,
        impact,
        avatar,
        sentiment,
        url,
      };
    });

    const filtered = mapped.filter((r) => {
      if (!q) return true;
      const needle = q.toLowerCase();
      return (
        r.name.toLowerCase().includes(needle) ||
        r.handle.toLowerCase().includes(needle)
      );
    });

    return filtered.sort(sorters[sortKey]).slice(0, limit);
  }, [rawData, q, sortKey, limit]);

  return (
    <Card>
      <div className="flex gap-4 px-4 ml-3">
        <Users className="h-5 w-5 text-purple-500" />
        <CardTitle>Creator Leaderboard</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top BONK voices ranked by impact and reach
        </p>
      </div>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex gap-2">
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impact">Impact</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Input
              className="w-48"
              placeholder="Search creators…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() =>
                setSortKey(sortKey === "impact" ? "followers" : "impact")
              }
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <div className="h-24 w-full rounded-md bg-muted animate-pulse" />
        )}

        {!isLoading && error && (
          <div className="text-sm text-red-600">
            Unable to load influencers: {error.message}
          </div>
        )}

        {!isLoading &&
          !error &&
          rows.map((r, idx) => (
            <div
              key={`${r.id}-${idx}`}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-muted-foreground w-6 text-right">
                  #{idx + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={r.avatar || ""} />
                  <AvatarFallback>
                    {r.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.name}</span>
                    <Badge variant={sentimentBadgeVariant(r.sentiment)}>
                      {r.sentiment}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.handle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {(r.impact ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {r.impact >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    Impact
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {(r.followers ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>

                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}

        {!isLoading && !error && !rows.length && (
          <div className="text-sm text-muted-foreground">
            No influencers found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
