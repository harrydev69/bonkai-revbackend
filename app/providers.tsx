"use client";

import { FC, ReactNode, useMemo } from "react";
import { SWRConfig } from "swr";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

interface ProvidersProps { children: ReactNode }

// --- tiny client-side queue to space internal /api calls ---
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastInternalTs = 0;
const GAP_MS = 350; // ~3 req/sec max burst from the browser

async function queuedFetcher(key: string) {
  // Only throttle your own API routes; external URLs pass through
  const url = new URL(key, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  const isInternalApi = url.origin === (typeof window !== "undefined" ? window.location.origin : url.origin)
    && url.pathname.startsWith("/api/");

  if (isInternalApi) {
    const delta = Date.now() - lastInternalTs;
    const wait = delta < GAP_MS ? GAP_MS - delta : 0;
    if (wait > 0) await sleep(wait);
    lastInternalTs = Date.now();
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

const queryClient = new QueryClient();

export const Providers: FC<ProvidersProps> = ({ children }) => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");
  const network = WalletAdapterNetwork.Mainnet;

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig
        value={{
          fetcher: queuedFetcher,
          // strong dedupe so identical keys within 15s collapse to 1 request
          dedupingInterval: 15_000,
          // avoid burst revalidations on focus/navigation
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          focusThrottleInterval: 20_000,
          // you can still set per-hook refreshInterval in components
          shouldRetryOnError: false,
        }}
      >
        <ConnectionProvider endpoint={endpoint}>
          <SolanaWalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </SolanaWalletProvider>
        </ConnectionProvider>
      </SWRConfig>
    </QueryClientProvider>
  );
};
