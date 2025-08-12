"use client"

import { FC, ReactNode, useMemo } from "react"
import { clusterApiUrl } from "@solana/web3.js"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import "@solana/wallet-adapter-react-ui/styles.css"

interface ProvidersProps { children: ReactNode }

export const Providers: FC<ProvidersProps> = ({ children }) => {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta")
  const network = WalletAdapterNetwork.Mainnet

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}
