import { NextResponse } from 'next/server'

// Fetch SOL balance and SPL token balances for a given wallet. This route
// communicates directly with a Solana RPC endpoint. The default endpoint is
// mainnet-beta but can be overridden via the SOLANA_RPC_URL environment
// variable. Token accounts are returned with both raw and UI amounts. In
// production you may wish to filter the list to only include specific tokens.

async function rpcCall(rpcUrl: string, method: string, params: any[]): Promise<any> {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'RPC error')
  return json.result
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')
  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet parameter' }, { status: 400 })
  }
  // Construct the RPC URL. Prefer SOLANA_RPC_URL if provided. If a Helius API
  // key is supplied and the URL does not already contain an api‑key
  // parameter, append it automatically. This simplifies configuration
  // when using Helius without requiring the api‑key=... in the URL.
  let rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
  const heliusKey = process.env.HELIUS_API_KEY
  if (heliusKey && !rpcUrl.includes('api-key=')) {
    rpcUrl += (rpcUrl.includes('?') ? '&' : '?') + `api-key=${heliusKey}`
  }
  try {
    // Fetch SOL balance (lamports)
    const balanceResult = await rpcCall(rpcUrl, 'getBalance', [wallet])
    const sol = (balanceResult.value || 0) / 1e9

    // Fetch token accounts owned by the wallet via the token program
    const tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    const tokenAccountsResult = await rpcCall(rpcUrl, 'getTokenAccountsByOwner', [wallet, { programId: tokenProgram }, { encoding: 'jsonParsed' }])
    const tokens: any[] = []
    for (const acc of tokenAccountsResult.value || []) {
      const info = acc.account.data.parsed.info
      const mint = info.mint
      const tokenAmount = info.tokenAmount
      const amount = tokenAmount.amount
      const uiAmount = parseFloat(tokenAmount.uiAmountString)
      const decimals = tokenAmount.decimals
      // Derive a symbol for known tokens using environment variables. This
      // mapping allows downstream consumers to identify BONK and nBONK
      // balances without requiring an external token list. Unknown mints
      // will have a symbol of 'UNKNOWN'. You can configure BONK_MINT
      // and NBONK_MINT in your environment to customise these values.
      let symbol = 'UNKNOWN'
      const bonkMint = process.env.BONK_MINT || 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
      const nbonkMint = process.env.NBONK_MINT || ''
      if (mint === bonkMint) symbol = 'BONK'
      else if (nbonkMint && mint === nbonkMint) symbol = 'nBONK'
      tokens.push({ mint, symbol, amount, uiAmount, decimals })
    }
    return NextResponse.json({ wallet, sol, tokens, updatedAt: new Date().toISOString() })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch balance' }, { status: 500 })
  }
}

