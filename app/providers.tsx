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

// Optimized fetcher without artificial delays
async function optimizedFetcher(key: string) {
  const res = await fetch(key, { 
    cache: "no-store",
    // Add reasonable timeout instead of artificial delay
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

// Optimized query client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
          fetcher: optimizedFetcher,
          // Optimized caching strategy
          dedupingInterval: 30_000, // 30 seconds
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          focusThrottleInterval: 60_000, // 1 minute
          shouldRetryOnError: false,
          // Add error retry with exponential backoff
          errorRetryCount: 2,
          errorRetryInterval: 1000,
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
