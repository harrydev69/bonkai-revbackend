// Feature flags for the BONKai platform
// These flags control which features and integrations are enabled

export interface FeatureFlags {
  // Primary data source (CoinGecko)
  hasCoinGecko: boolean
  
  // Fallback data sources (kept for emergency use)
  hasCoinMarketCap: boolean
  hasMessari: boolean
  hasCryptoCompare: boolean
  
  // Other integrations
  hasLunarCrush: boolean
  hasNewsAPI: boolean
  hasJatevoAI: boolean
  hasHelius: boolean
  hasDexScreener: boolean
  hasRaydium: boolean
  hasBitquery: boolean
  hasTokenMetrics: boolean
  hasCoinStats: boolean
  hasBinance: boolean
  hasBybit: boolean
  hasOKX: boolean
  
  // App features
  hasPremium: boolean
  hasAlerts: boolean
  hasChat: boolean
  hasAudio: boolean
  hasExport: boolean
  hasAnalytics: boolean
  hasSentiment: boolean
  hasMindshare: boolean
  hasWhaleTracking: boolean
  hasInfluencerTracking: boolean
  hasSocialFeeds: boolean
  hasNewsFeeds: boolean
  hasCalendar: boolean
  hasSearch: boolean
  hasUserProfiles: boolean
  hasSettings: boolean
  hasAdmin: boolean
}

// Default feature flags based on environment variables
export const defaultFeatureFlags: FeatureFlags = {
  // Primary: CoinGecko (Analyst plan - 500 calls/minute)
  hasCoinGecko: !!process.env.COINGECKO_API_KEY,
  
  // Fallback: Other providers (kept for emergency use)
  hasCoinMarketCap: !!process.env.COINMARKETCAP_API_KEY,
  hasMessari: !!process.env.MESSARI_API_KEY,
  hasCryptoCompare: !!process.env.CRYPTOPCOMPARE_API_KEY,
  
  // Other integrations
  hasLunarCrush: !!process.env.LUNARCRUSH_API_KEY,
  hasNewsAPI: !!process.env.NEWSAPI_KEY,
  hasJatevoAI: !!process.env.JATEVO_API_KEY,
  hasHelius: !!process.env.HELIUS_API_KEY,
  hasDexScreener: !!process.env.DEXSCREENER_BASE,
  hasRaydium: !!process.env.RAYDIUM_V3,
  hasBitquery: !!process.env.BITQUERY_API_KEY,
  hasTokenMetrics: !!process.env.TOKENMETRICS_API_KEY,
  hasCoinStats: !!process.env.COINSTATS_API_KEY,
  hasBinance: !!process.env.BINANCE_FAPI_BASE,
  hasBybit: !!process.env.BYBIT_V5_BASE,
  hasOKX: !!process.env.OKX_V5_BASE,
  
  // App features (always enabled)
  hasPremium: true,
  hasAlerts: true,
  hasChat: true,
  hasAudio: true,
  hasExport: true,
  hasAnalytics: true,
  hasSentiment: true,
  hasMindshare: true,
  hasWhaleTracking: true,
  hasInfluencerTracking: true,
  hasSocialFeeds: true,
  hasNewsFeeds: true,
  hasCalendar: true,
  hasSearch: true,
  hasUserProfiles: true,
  hasSettings: true,
  hasAdmin: true,
}

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return defaultFeatureFlags[feature] || false
}

// Helper function to get all enabled features
export function getEnabledFeatures(): string[] {
  return Object.entries(defaultFeatureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature)
}

// Helper function to check if primary data source is available
export function hasPrimaryDataSource(): boolean {
  return defaultFeatureFlags.hasCoinGecko
}

// Helper function to check if any fallback data sources are available
export function hasFallbackDataSources(): boolean {
  return defaultFeatureFlags.hasCoinMarketCap || 
         defaultFeatureFlags.hasMessari || 
         defaultFeatureFlags.hasCryptoCompare
}

// Helper function to get data source priority
export function getDataSourcePriority(): string[] {
  const sources: string[] = []
  
  // Primary source
  if (defaultFeatureFlags.hasCoinGecko) {
    sources.push('coingecko')
  }
  
  // Fallback sources (in order of preference)
  if (defaultFeatureFlags.hasCoinMarketCap) {
    sources.push('coinmarketcap')
  }
  if (defaultFeatureFlags.hasMessari) {
    sources.push('messari')
  }
  if (defaultFeatureFlags.hasCryptoCompare) {
    sources.push('cryptocompare')
  }
  
  return sources
}
