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

// Enhanced fetcher with request deduplication and intelligent caching
const requestCache = new Map<string, Promise<any>>();

async function enhancedFetcher(key: string) {
  // Check if request is already in flight
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }

  // Create new request
  const requestPromise = fetch(key, { 
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'BonkAI-Analytics/1.0'
    }
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    return res.json();
  }).finally(() => {
    // Clean up request cache after completion
    requestCache.delete(key);
  });

  // Store request in cache
  requestCache.set(key, requestPromise);
  return requestPromise;
}

// Advanced query client with crypto-specific optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Intelligent stale time based on data type
      staleTime: (query) => {
        const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        
        // Price data: 30 seconds
        if (typeof queryKey === 'string' && queryKey.includes('price')) return 30 * 1000;
        
        // Market data: 1 minute
        if (typeof queryKey === 'string' && queryKey.includes('market')) return 60 * 1000;
        
        // Social sentiment: 5 minutes
        if (typeof queryKey === 'string' && queryKey.includes('sentiment')) return 5 * 60 * 1000;
        
        // News/feeds: 15 minutes
        if (typeof queryKey === 'string' && queryKey.includes('feeds')) return 15 * 60 * 1000;
        
        // Static data: 1 hour
        if (typeof queryKey === 'string' && queryKey.includes('tokenomics')) return 60 * 60 * 1000;
        
        // Default: 5 minutes
        return 5 * 60 * 1000;
      },
      
      // Garbage collection time
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry strategy
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        
        // Retry up to 2 times for 5xx errors
        return failureCount < 2;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Optimize for crypto data
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Background updates
      refetchInterval: (query) => {
        const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        
        // Price data: every 30 seconds
        if (typeof queryKey === 'string' && queryKey.includes('price')) return 30 * 1000;
        
        // Market data: every 2 minutes
        if (typeof queryKey === 'string' && queryKey.includes('market')) return 2 * 60 * 1000;
        
        // Social data: every 5 minutes
        if (typeof queryKey === 'string' && queryKey.includes('feeds')) return 5 * 60 * 1000;
        
        // Default: no background updates
        return false;
      },
      
      // Optimize for mobile
      refetchIntervalInBackground: false,
    },
    
    mutations: {
      // Optimistic updates for better UX
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['bonk'] });
        
        // Snapshot previous value
        const previousData = queryClient.getQueryData(['bonk']);
        
        // Return context with snapshotted value
        return { previousData };
      },
      
      // Rollback on error
      onError: (err, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(['bonk'], context.previousData);
        }
      },
      
      // Always refetch after error or success
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['bonk'] });
      },
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
          fetcher: enhancedFetcher,
          
          // Advanced caching strategy
          dedupingInterval: 30_000, // 30 seconds
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          focusThrottleInterval: 60_000, // 1 minute
          
          // Error handling
          shouldRetryOnError: (error: any) => {
            // Don't retry on 4xx errors
            if (error?.status >= 400 && error?.status < 500) return false;
            return true;
          },
          errorRetryCount: 2,
          errorRetryInterval: 1000,
          
          // Optimize for crypto data
          keepPreviousData: true,
          revalidateIfStale: true,
          
          // Background sync
          revalidateOnMount: true,
          revalidateOnFocus: false,
          
          // Cache optimization
          compare: (a, b) => {
            // Custom comparison for crypto data
            if (a?.lastUpdated && b?.lastUpdated) {
              return a.lastUpdated === b.lastUpdated;
            }
            return a === b;
          },
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
