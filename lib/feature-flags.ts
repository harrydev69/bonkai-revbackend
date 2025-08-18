// Feature flags utility for BONKai
// Allows conditional rendering of features based on environment variables and API availability

export interface FeatureFlags {
  // Core features
  enableMetaSearch: boolean
  enableNarrative: boolean
  enableMindshare: boolean
  enableAudioStreaming: boolean
  enableRealTimeMetrics: boolean
  
  // API integrations
  enableGoogleCalendar: boolean
  enableNotion: boolean
  enableAWS: boolean
  enableDune: boolean
  enableFlipside: boolean
  enableSolscan: boolean
  
  // Data sources
  hasCoinGecko: boolean
  hasCoinMarketCap: boolean
  hasMessari: boolean
  hasCryptoCompare: boolean
  hasLunarCrush: boolean
  hasCryptoPanic: boolean
}

// Get feature flags from environment variables
export function getFeatureFlags(): FeatureFlags {
  return {
    // Core features
    enableMetaSearch: process.env.ENABLE_META_SEARCH === 'true',
    enableNarrative: process.env.ENABLE_NARRATIVE === 'true',
    enableMindshare: process.env.ENABLE_MINDSHARE === 'true',
    enableAudioStreaming: process.env.ENABLE_AUDIO_STREAMING === 'true',
    enableRealTimeMetrics: process.env.ENABLE_REAL_TIME_METRICS === 'true',
    
    // API integrations
    enableGoogleCalendar: !!(process.env.GOOGLE_CALENDAR_API_KEY && process.env.GOOGLE_CALENDAR_ID),
    enableNotion: !!(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID),
    enableAWS: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_S3_BUCKET),
    enableDune: !!process.env.DUNE_API_KEY,
    enableFlipside: !!process.env.FLIPSIDE_API_KEY,
    enableSolscan: !!process.env.SOLSCAN_API_KEY,
    
    // Data sources
    hasCoinGecko: !!process.env.COINGECKO_API_KEY,
    hasCoinMarketCap: !!process.env.COINMARKETCAP_API_KEY,
    hasMessari: !!process.env.MESSARI_API_KEY,
    hasCryptoCompare: !!process.env.CRYPTOCOMPARE_API_KEY,
    hasLunarCrush: !!process.env.LUNARCRUSH_API_KEY,
    hasCryptoPanic: !!process.env.CRYPTOPANIC_API_KEY,
  }
}

// Check if a specific feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags()
  return flags[feature] || false
}

// Get a list of enabled features
export function getEnabledFeatures(): string[] {
  const flags = getFeatureFlags()
  return Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature)
}

// Get a list of disabled features
export function getDisabledFeatures(): string[] {
  const flags = getFeatureFlags()
  return Object.entries(flags)
    .filter(([_, enabled]) => !enabled)
    .map(([feature, _]) => feature)
}

// Check if all required features for a component are enabled
export function areFeaturesEnabled(features: (keyof FeatureFlags)[]): boolean {
  return features.every(feature => isFeatureEnabled(feature))
}

// Get feature status summary
export function getFeatureStatus(): {
  total: number
  enabled: number
  disabled: number
  coverage: number
} {
  const flags = getFeatureFlags()
  const total = Object.keys(flags).length
  const enabled = Object.values(flags).filter(Boolean).length
  const disabled = total - enabled
  const coverage = Math.round((enabled / total) * 100)
  
  return { total, enabled, disabled, coverage }
}
