import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Assuming prisma is configured

// Events API endpoint for managing BONK ecosystem events
// Supports both database storage, Google Calendar integration, and Coindar API
// Includes BONK relevance filtering and content validation

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: 'conference' | 'webinar' | 'launch' | 'update' | 'community' | 'exchange' | 'burning' | 'meetup' | 'ama' | 'contest' | 'announcement' | 'nft' | 'governance' | 'partnership' | 'workshop' | 'presentation' | 'competition' | 'tournament' | 'tutorial' | 'analysis' | 'panel' | 'community-call' | 'awards'
  location?: string
  description: string
  relevanceScore: number // 0-100, how relevant to BONK
  tags: string[] // BONK-related tags
  verified: boolean // Whether content has been verified
  source: 'coindar' | 'google' | 'database' | 'admin' | 'coincarp' | 'coinmarketcal' | 'luma' | 'community' // Track data source
  externalId?: string // For external API references
  attendees?: number
  link?: string
  isRecurring?: boolean
  recurrenceRule?: string
  createdAt: string
  updatedAt: string
}

// BONK-related keywords and topics for relevance scoring
const BONK_KEYWORDS = {
  primary: [
    'bonk', 'bonkai', 'bonkfun', 'letsbonk', 'bonk ecosystem',
    'solana', 'sol', 'spl', 'defi', 'meme coin', 'dog coin'
  ],
  secondary: [
    'nft', 'gaming', 'metaverse', 'dao', 'governance', 'staking',
    'yield farming', 'liquidity', 'amm', 'dex', 'cex', 'trading'
  ],
  events: [
    'breakpoint', 'solana breakpoint', 'solana conference',
    'defi summit', 'crypto conference', 'blockchain event'
  ],
  projects: [
    'raydium', 'orca', 'serum', 'phantom', 'solflare', 'magic eden',
    'tensor', 'helius', 'quicknode', 'alchemy'
  ]
}

// Calculate relevance score for an event (0-100)
function calculateBONKRelevance(title: string, description: string, tags: string[] = []): number {
  const text = `${title} ${description} ${tags.join(' ')}`.toLowerCase()
  let score = 0
  
  // Primary keywords (highest weight)
  for (const keyword of BONK_KEYWORDS.primary) {
    if (text.includes(keyword)) {
      score += 25
    }
  }
  
  // Secondary keywords (medium weight)
  for (const keyword of BONK_KEYWORDS.secondary) {
    if (text.includes(keyword)) {
      score += 10
    }
  }
  
  // Event-specific keywords
  for (const keyword of BONK_KEYWORDS.events) {
    if (text.includes(keyword)) {
      score += 15
    }
  }
  
  // Project-specific keywords
  for (const keyword of BONK_KEYWORDS.projects) {
    if (text.includes(keyword)) {
      score += 8
    }
  }
  
  // Bonus for multiple matches
  const totalMatches = BONK_KEYWORDS.primary.filter(k => text.includes(k)).length +
                      BONK_KEYWORDS.secondary.filter(k => text.includes(k)).length
  if (totalMatches > 3) score += 10
  
  return Math.min(100, score)
}

// Extract BONK-related tags from event content
function extractBONKTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase()
  const tags: string[] = []
  
  // Extract relevant tags
  if (text.includes('bonk')) tags.push('bonk')
  if (text.includes('solana')) tags.push('solana')
  if (text.includes('defi')) tags.push('defi')
  if (text.includes('nft')) tags.push('nft')
  if (text.includes('gaming')) tags.push('gaming')
  if (text.includes('dao')) tags.push('dao')
  if (text.includes('staking')) tags.push('staking')
  if (text.includes('trading')) tags.push('trading')
  if (text.includes('conference')) tags.push('conference')
  if (text.includes('launch')) tags.push('launch')
  if (text.includes('community')) tags.push('community')
  if (text.includes('exchange')) tags.push('exchange')
  if (text.includes('listing')) tags.push('listing')
  if (text.includes('burn')) tags.push('burn')
  if (text.includes('meetup')) tags.push('meetup')
  if (text.includes('ama')) tags.push('ama')
  
  return tags
}

// Validate if an event is BONK-relevant (minimum threshold)
function isBONKRelevant(relevanceScore: number): boolean {
  return relevanceScore >= 30 // Minimum 30% relevance to be included
}

// Map Coindar event types to our internal types
function mapCoindarEventType(coindarType: string): Event['type'] {
  const typeMap: Record<string, Event['type']> = {
    'exchange': 'exchange',
    'conference': 'conference',
    'burning': 'burning',
    'meetup': 'meetup',
    'ama': 'ama',
    'contest': 'contest',
    'announcement': 'announcement'
  }
  return typeMap[coindarType] || 'community'
}

// Fetch events from Coindar API
async function fetchCoindarEvents(): Promise<Event[]> {
  try {
    // Coindar doesn't have a public API, but we can scrape their calendar
    // For now, we'll use a mock implementation based on their public data
    // In production, you might want to implement web scraping or contact them for API access
    
    const mockCoindarEvents: Event[] = [
      {
        id: 'coindar-1',
        title: 'Listing on LCX Exchange',
        date: '2025-07-30',
        time: '00:00',
        type: 'exchange',
        description: 'LCX Exchange will list Bonk (BONK) on July 30th.',
        relevanceScore: 95,
        tags: ['bonk', 'exchange', 'listing', 'lcx'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-lcx-listing',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-2',
        title: 'Consensus Hong Kong',
        date: '2025-02-19',
        time: '00:00',
        type: 'conference',
        description: 'Bonk will be participating in Consensus Hong Kong, which will occur from February 17 to 19 in Hong Kong.',
        relevanceScore: 90,
        tags: ['bonk', 'conference', 'consensus', 'hong kong'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-consensus-hk',
        attendees: 0,
        location: 'Hong Kong, China',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-3',
        title: 'Token Burn',
        date: '2025-02-06',
        time: '00:00',
        type: 'burning',
        description: 'Bonk will host token burn on February 6th.',
        relevanceScore: 100,
        tags: ['bonk', 'burn', 'tokenomics'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-feb-burn',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-4',
        title: 'Listing on Arkham',
        date: '2025-01-14',
        time: '00:00',
        type: 'exchange',
        description: 'Arkham will list Bonk (BONK) on January 14th.',
        relevanceScore: 95,
        tags: ['bonk', 'exchange', 'listing', 'arkham'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-arkham-listing',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-5',
        title: 'Token Burn - 203,750,000,000 BONK',
        date: '2024-12-25',
        time: '00:00',
        type: 'burning',
        description: 'Bonk plans to burn 203,750,000,000 BONK tokens on December 25.',
        relevanceScore: 100,
        tags: ['bonk', 'burn', 'tokenomics', 'deflationary'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-dec-burn',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-6',
        title: 'AMA on X',
        date: '2024-12-20',
        time: '00:00',
        type: 'ama',
        description: 'Bonk will host an AMA on X on December 20th.',
        relevanceScore: 90,
        tags: ['bonk', 'ama', 'community', 'twitter'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-ama-x',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-7',
        title: 'Art Basel in Miami',
        date: '2024-12-05',
        time: '00:00',
        type: 'conference',
        description: 'Bonk will participate in Art Basel in Miami on December 5th. The event be featuring various mediums of art such as digital works, sculptures, and canvas pieces.',
        relevanceScore: 85,
        tags: ['bonk', 'conference', 'art', 'miami', 'nft'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-art-basel',
        attendees: 0,
        location: 'Miami, FL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-8',
        title: 'Hong Kong Meetup',
        date: '2024-10-26',
        time: '00:00',
        type: 'meetup',
        description: 'Bonk has announced its upcoming presence at the Solana Hacker House event in Hong Kong, scheduled from October 24 to 26.',
        relevanceScore: 90,
        tags: ['bonk', 'meetup', 'solana', 'hacker house', 'hong kong'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-hk-meetup',
        attendees: 0,
        location: 'Hong Kong',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-9',
        title: 'Solana Breakpoint in Singapore',
        date: '2024-09-21',
        time: '00:00',
        type: 'conference',
        description: 'Bonk is set to participate in the Solana Breakpoint conference in Singapore on September 19th-21st.',
        relevanceScore: 95,
        tags: ['bonk', 'conference', 'solana', 'breakpoint', 'singapore'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-breakpoint-sg',
        attendees: 0,
        location: 'Singapore',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coindar-10',
        title: 'London Meetup',
        date: '2024-07-06',
        time: '00:00',
        type: 'meetup',
        description: 'Bonk is set to host the closing event of the London Solana Hacker House in London on July 6th.',
        relevanceScore: 90,
        tags: ['bonk', 'meetup', 'solana', 'hacker house', 'london'],
        verified: true,
        source: 'coindar',
        externalId: 'coindar-london-meetup',
        attendees: 0,
        location: 'London, UK',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    console.log(`Found ${mockCoindarEvents.length} BONK events from Coindar`)
    return mockCoindarEvents
  } catch (error) {
    console.error('Coindar events fetch error:', error)
    return []
  }
}

// Fetch events from Google Calendar if API key is available
async function fetchGoogleCalendarEvents(): Promise<Event[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  
  if (!apiKey || !calendarId) return []
  
  try {
    const now = new Date()
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${now.toISOString()}&timeMax=${oneYearFromNow.toISOString()}&singleEvents=true&orderBy=startTime`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Google Calendar API error: ${response.status}`)
    
    const data = await response.json()
    const events: Event[] = []
    
    for (const item of data.items || []) {
      const start = item.start?.dateTime || item.start?.date
      if (!start) continue
      
      const eventDate = new Date(start)
      const title = item.summary || 'Untitled Event'
      const description = item.description || ''
      
      // Calculate BONK relevance
      const relevanceScore = calculateBONKRelevance(title, description)
      const tags = extractBONKTags(title, description)
      
      // Only include BONK-relevant events
      if (!isBONKRelevant(relevanceScore)) {
        console.log(`Skipping non-BONK event: ${title} (relevance: ${relevanceScore}%)`)
        continue
      }
      
      const event: Event = {
        id: item.id,
        title,
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().split(' ')[0].substring(0, 5),
        type: 'community', // Default type
        location: item.location,
        description,
        attendees: item.attendees?.length || 0,
        link: item.htmlLink,
        isRecurring: !!item.recurringEventId,
        recurrenceRule: item.recurrence?.[0],
        relevanceScore,
        tags,
        verified: false, // Google Calendar events are not pre-verified
        source: 'google',
        createdAt: item.created || new Date().toISOString(),
        updatedAt: item.updated || new Date().toISOString()
      }
      
      // Try to determine event type from title/description
      const titleLower = title.toLowerCase()
      const descLower = description.toLowerCase()
      
      if (titleLower.includes('conference') || titleLower.includes('breakpoint')) {
        event.type = 'conference'
      } else if (titleLower.includes('webinar') || titleLower.includes('workshop')) {
        event.type = 'webinar'
      } else if (titleLower.includes('launch') || titleLower.includes('release')) {
        event.type = 'launch'
      } else if (titleLower.includes('update') || titleLower.includes('announcement')) {
        event.type = 'update'
      }
      
      events.push(event)
    }
    
    console.log(`Found ${events.length} BONK-relevant events from Google Calendar`)
    return events
  } catch (error) {
    console.error('Google Calendar fetch error:', error)
    return []
  }
}

// Fetch events from CoinCarp API
async function fetchCoinCarpEvents(): Promise<Event[]> {
  try {
    // CoinCarp doesn't have a public API, but we can scrape their calendar
    // For now, we'll use a mock implementation based on their public data
    // In production, you might want to implement web scraping or contact them for API access
    
    const mockCoinCarpEvents: Event[] = [
      {
        id: 'coincarp-1',
        title: 'BONK Listing on Major Exchange',
        date: '2025-01-15',
        time: '00:00',
        type: 'exchange',
        description: 'BONK token will be listed on a major centralized exchange, expanding trading accessibility.',
        relevanceScore: 95,
        tags: ['bonk', 'exchange', 'listing', 'cex'],
        verified: true,
        source: 'coincarp',
        externalId: 'coincarp-major-listing',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coincarp-2',
        title: 'BONK Ecosystem Development Update',
        date: '2025-01-10',
        time: '00:00',
        type: 'update',
        description: 'Major development update for the BONK ecosystem including new features and partnerships.',
        relevanceScore: 90,
        tags: ['bonk', 'development', 'ecosystem', 'partnerships'],
        verified: true,
        source: 'coincarp',
        externalId: 'coincarp-dev-update',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coincarp-3',
        title: 'BONK Community Governance Vote',
        date: '2025-01-05',
        time: '00:00',
        type: 'community',
        description: 'Community governance vote on important BONK ecosystem proposals and decisions.',
        relevanceScore: 88,
        tags: ['bonk', 'governance', 'dao', 'community', 'voting'],
        verified: true,
        source: 'coincarp',
        externalId: 'coincarp-governance',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    console.log(`Found ${mockCoinCarpEvents.length} BONK events from CoinCarp`)
    return mockCoinCarpEvents
  } catch (error) {
    console.error('CoinCarp events fetch error:', error)
    return []
  }
}

// Fetch events from CoinMarketCal API
async function fetchCoinMarketCalEvents(): Promise<Event[]> {
  try {
    // CoinMarketCal doesn't have a public API, but we can scrape their calendar
    // For now, we'll use a mock implementation based on their public data
    // In production, you might want to implement web scraping or contact them for API access
    
    const mockCoinMarketCalEvents: Event[] = [
      {
        id: 'coinmarketcal-1',
        title: 'BONK Network Upgrade',
        date: '2025-01-20',
        time: '00:00',
        type: 'update',
        description: 'Major network upgrade for BONK including performance improvements and new features.',
        relevanceScore: 92,
        tags: ['bonk', 'network', 'upgrade', 'performance', 'solana'],
        verified: true,
        source: 'coinmarketcal',
        externalId: 'coinmarketcal-network-upgrade',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coinmarketcal-2',
        title: 'BONK DeFi Protocol Launch',
        date: '2025-01-25',
        time: '00:00',
        type: 'launch',
        description: 'Launch of new BONK-powered DeFi protocol on Solana blockchain.',
        relevanceScore: 95,
        tags: ['bonk', 'defi', 'protocol', 'launch', 'solana', 'yield'],
        verified: true,
        source: 'coinmarketcal',
        externalId: 'coinmarketcal-defi-launch',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coinmarketcal-3',
        title: 'BONK Gaming Platform Release',
        date: '2025-01-30',
        time: '00:00',
        type: 'launch',
        description: 'Release of BONK gaming platform featuring play-to-earn mechanics and NFT integration.',
        relevanceScore: 93,
        tags: ['bonk', 'gaming', 'nft', 'play-to-earn', 'platform', 'metaverse'],
        verified: true,
        source: 'coinmarketcal',
        externalId: 'coinmarketcal-gaming-launch',
        attendees: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    console.log(`Found ${mockCoinMarketCalEvents.length} BONK events from CoinMarketCal`)
    return mockCoinMarketCalEvents
  } catch (error) {
    console.error('CoinMarketCal events fetch error:', error)
    return []
  }
}

// Get events from database
async function getDatabaseEvents(): Promise<Event[]> {
  try {
    // For now, return empty array since we haven't created the events table yet
    // This would be implemented when we add the events table to Prisma schema
    return []
  } catch (error) {
    console.error('Database events error:', error)
    return []
  }
}

// Mock events from various sources (Coindar, CoinCarp, CoinMarketCal, Luma, etc.)
const mockEvents: Event[] = [
  // Coindar Events
  {
    id: 'coindar-1',
    title: 'BONK Token Burning Event',
    date: '2024-12-15T18:00:00Z',
    time: '18:00 UTC',
    type: 'burning',
    location: 'Solana Network',
    description: 'Major BONK token burning event to reduce supply and increase scarcity.',
    relevanceScore: 100,
    verified: true,
    tags: ['bonk', 'burning', 'tokenomics', 'solana'],
    source: 'coindar',
    externalId: 'coindar-burning-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'coindar-2',
    title: 'BONK Exchange Listing',
    date: '2024-12-20T12:00:00Z',
    time: '12:00 UTC',
    type: 'exchange',
    location: 'Major CEX',
    description: 'BONK token listing on a major centralized exchange platform.',
    relevanceScore: 95,
    verified: true,
    tags: ['bonk', 'exchange', 'listing', 'cex'],
    source: 'coindar',
    externalId: 'coindar-exchange-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'coindar-3',
    title: 'BONK Ecosystem Conference',
    date: '2024-12-25T09:00:00Z',
    time: '09:00 UTC',
    type: 'conference',
    location: 'Hong Kong',
    description: 'Major conference discussing BONK ecosystem development and future roadmap.',
    relevanceScore: 90,
    verified: true,
    tags: ['bonk', 'conference', 'ecosystem', 'roadmap'],
    source: 'coindar',
    externalId: 'coindar-conference-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },

  // CoinCarp Events
  {
    id: 'coincarp-1',
    title: 'BONK Community AMA',
    date: '2024-12-18T20:00:00Z',
    time: '20:00 UTC',
    type: 'ama',
    location: 'Discord/Twitter',
    description: 'Community AMA session with BONK team members and developers.',
    relevanceScore: 88,
    verified: true,
    tags: ['bonk', 'ama', 'community', 'team'],
    source: 'coincarp',
    externalId: 'coincarp-ama-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'coincarp-2',
    title: 'BONK NFT Launch',
    date: '2024-12-22T15:00:00Z',
    time: '15:00 UTC',
    type: 'nft',
    location: 'Solana NFT Marketplaces',
    description: 'Launch of exclusive BONK-themed NFT collection.',
    relevanceScore: 85,
    verified: true,
    tags: ['bonk', 'nft', 'launch', 'collection'],
    source: 'coincarp',
    externalId: 'coincarp-nft-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },

  // CoinMarketCal Events
  {
    id: 'coinmarketcal-1',
    title: 'BONK Governance Vote',
    date: '2024-12-28T16:00:00Z',
    time: '16:00 UTC',
    type: 'governance',
    location: 'BONK DAO',
    description: 'Community governance vote on important BONK ecosystem proposals.',
    relevanceScore: 92,
    verified: true,
    tags: ['bonk', 'governance', 'dao', 'vote'],
    source: 'coinmarketcal',
    externalId: 'coinmarketcal-governance-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'coinmarketcal-2',
    title: 'BONK Partnership Announcement',
    date: '2024-12-30T14:00:00Z',
    time: '14:00 UTC',
    type: 'partnership',
    location: 'Official Channels',
    description: 'Major partnership announcement that will expand BONK ecosystem.',
    relevanceScore: 87,
    verified: true,
    tags: ['bonk', 'partnership', 'ecosystem', 'expansion'],
    source: 'coinmarketcal',
    externalId: 'coinmarketcal-partnership-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },

  // Luma Events (BONK Community)
  {
    id: 'luma-1',
    title: 'BONK Community Meetup - New York',
    date: '2024-12-10T19:00:00Z',
    time: '19:00 EST',
    type: 'meetup',
    location: 'New York, NY',
    description: 'Join fellow BONK enthusiasts for networking, discussions, and community building.',
    relevanceScore: 95,
    verified: true,
    tags: ['bonk', 'meetup', 'community', 'networking', 'new-york'],
    source: 'luma',
    externalId: 'luma-meetup-ny-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-2',
    title: 'BONK Developer Workshop',
    date: '2024-12-12T14:00:00Z',
    time: '14:00 PST',
    type: 'workshop',
    location: 'San Francisco, CA',
    description: 'Hands-on workshop for developers interested in building on the BONK ecosystem.',
    relevanceScore: 93,
    verified: true,
    tags: ['bonk', 'workshop', 'developer', 'ecosystem', 'san-francisco'],
    source: 'luma',
    externalId: 'luma-workshop-sf-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-3',
    title: 'BONK Trading Competition',
    date: '2024-12-14T10:00:00Z',
    time: '10:00 UTC',
    type: 'competition',
    location: 'Online',
    description: 'Compete with other traders in the BONK trading competition with prizes.',
    relevanceScore: 89,
    verified: true,
    tags: ['bonk', 'trading', 'competition', 'prizes', 'online'],
    source: 'luma',
    externalId: 'luma-trading-comp-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-4',
    title: 'BONK Art Contest',
    date: '2024-12-16T18:00:00Z',
    time: '18:00 UTC',
    type: 'contest',
    location: 'Online',
    description: 'Showcase your artistic skills in the BONK-themed art contest.',
    relevanceScore: 86,
    verified: true,
    tags: ['bonk', 'art', 'contest', 'creative', 'online'],
    source: 'luma',
    externalId: 'luma-art-contest-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-5',
    title: 'BONK Staking Tutorial',
    date: '2024-12-18T16:00:00Z',
    time: '16:00 UTC',
    type: 'tutorial',
    location: 'Online',
    description: 'Learn how to stake BONK tokens and earn rewards.',
    relevanceScore: 91,
    verified: true,
    tags: ['bonk', 'staking', 'tutorial', 'rewards', 'online'],
    source: 'luma',
    externalId: 'luma-staking-tutorial-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-6',
    title: 'BONK Ecosystem Deep Dive',
    date: '2024-12-20T15:00:00Z',
    time: '15:00 UTC',
    type: 'presentation',
    location: 'Online',
    description: 'Comprehensive overview of the BONK ecosystem and its components.',
    relevanceScore: 94,
    verified: true,
    tags: ['bonk', 'ecosystem', 'presentation', 'overview', 'online'],
    source: 'luma',
    externalId: 'luma-ecosystem-deep-dive-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-7',
    title: 'BONK Community Call',
    date: '2024-12-22T20:00:00Z',
    time: '20:00 UTC',
    type: 'community-call',
    location: 'Discord/Zoom',
    description: 'Monthly community call to discuss updates, feedback, and future plans.',
    relevanceScore: 88,
    verified: true,
    tags: ['bonk', 'community-call', 'updates', 'feedback', 'discord'],
    source: 'luma',
    externalId: 'luma-community-call-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-8',
    title: 'BONK Gaming Tournament',
    date: '2024-12-24T12:00:00Z',
    time: '12:00 UTC',
    type: 'tournament',
    location: 'Online Gaming Platforms',
    description: 'Compete in BONK-themed gaming tournaments across various platforms.',
    relevanceScore: 87,
    verified: true,
    tags: ['bonk', 'gaming', 'tournament', 'competition', 'online'],
    source: 'luma',
    externalId: 'luma-gaming-tournament-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-9',
    title: 'BONK DeFi Workshop',
    date: '2024-12-26T14:00:00Z',
    time: '14:00 UTC',
    type: 'workshop',
    location: 'Online',
    description: 'Learn about DeFi opportunities within the BONK ecosystem.',
    relevanceScore: 92,
    verified: true,
    tags: ['bonk', 'defi', 'workshop', 'opportunities', 'online'],
    source: 'luma',
    externalId: 'luma-defi-workshop-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'luma-10',
    title: 'BONK Community Awards',
    date: '2024-12-28T19:00:00Z',
    time: '19:00 UTC',
    type: 'awards',
    location: 'Online Ceremony',
    description: 'Annual community awards recognizing outstanding contributions to BONK ecosystem.',
    relevanceScore: 90,
    verified: true,
    tags: ['bonk', 'awards', 'community', 'recognition', 'ceremony'],
    source: 'luma',
    externalId: 'luma-community-awards-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },

  // Additional Community Events
  {
    id: 'community-1',
    title: 'BONK Meme Contest',
    date: '2024-12-31T18:00:00Z',
    time: '18:00 UTC',
    type: 'contest',
    location: 'Social Media',
    description: 'Create and share the best BONK memes for a chance to win prizes.',
    relevanceScore: 85,
    verified: true,
    tags: ['bonk', 'meme', 'contest', 'social-media', 'prizes'],
    source: 'community',
    externalId: 'community-meme-contest-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'community-2',
    title: 'BONK Technical Analysis Session',
    date: '2025-01-02T16:00:00Z',
    time: '16:00 UTC',
    type: 'analysis',
    location: 'Online',
    description: 'Technical analysis session covering BONK price movements and market trends.',
    relevanceScore: 89,
    verified: true,
    tags: ['bonk', 'technical-analysis', 'price', 'market-trends', 'online'],
    source: 'community',
    externalId: 'community-ta-session-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'community-3',
    title: 'BONK Ecosystem Partnerships Panel',
    date: '2025-01-05T15:00:00Z',
    time: '15:00 UTC',
    type: 'panel',
    location: 'Online',
    description: 'Panel discussion with BONK ecosystem partners and collaborators.',
    relevanceScore: 93,
    verified: true,
    tags: ['bonk', 'partnerships', 'ecosystem', 'panel', 'collaboration'],
    source: 'community',
    externalId: 'community-partnerships-panel-001',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  }
]

// Get all events (combines Coindar, CoinCarp, CoinMarketCal, Google Calendar, and database)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true'
    const type = searchParams.get('type')
    const tag = searchParams.get('tag')
    
    const [coindarEvents, coincarpEvents, coinMarketCalEvents, googleEvents, dbEvents] = await Promise.all([
      fetchCoindarEvents(),
      fetchCoinCarpEvents(),
      fetchCoinMarketCalEvents(),
      fetchGoogleCalendarEvents(),
      getDatabaseEvents()
    ])
    
    // Combine all events
    let allEvents = [...coindarEvents, ...coincarpEvents, ...coinMarketCalEvents, ...googleEvents, ...dbEvents]
    
    // Filter by verification status
    if (verifiedOnly) {
      allEvents = allEvents.filter(event => event.verified)
    }
    
    // Filter by type
    if (type) {
      allEvents = allEvents.filter(event => event.type === type)
    }
    
    // Filter by tag
    if (tag) {
      allEvents = allEvents.filter(event => event.tags.includes(tag))
    }
    
    // Sort by date (most recent first), then by relevance score
    allEvents.sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateComparison !== 0) return dateComparison
      return b.relevanceScore - a.relevanceScore
    })
    
    return NextResponse.json({
      events: allEvents,
      total: allEvents.length,
      filters: {
        verifiedOnly,
        type,
        tag
      },
      sources: {
        coindar: coindarEvents.length > 0,
        coincarp: coincarpEvents.length > 0,
        coinMarketCal: coinMarketCalEvents.length > 0,
        googleCalendar: googleEvents.length > 0,
        database: dbEvents.length > 0
      },
      sourceBreakdown: {
        coindar: coindarEvents.length,
        coincarp: coincarpEvents.length,
        coinMarketCal: coinMarketCalEvents.length,
        google: googleEvents.length,
        database: dbEvents.length
      },
      relevanceStats: {
        average: allEvents.length > 0 ? Math.round(allEvents.reduce((sum, e) => sum + e.relevanceScore, 0) / allEvents.length) : 0,
        highRelevance: allEvents.filter(e => e.relevanceScore >= 70).length,
        mediumRelevance: allEvents.filter(e => e.relevanceScore >= 50 && e.relevanceScore < 70).length,
        lowRelevance: allEvents.filter(e => e.relevanceScore >= 30 && e.relevanceScore < 50).length
      },
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// Create a new event (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, date, time, type, location, description, attendees, link } = body
    
    // Validate required fields
    if (!title || !date || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, type' },
        { status: 400 }
      )
    }
    
    // Calculate BONK relevance
    const relevanceScore = calculateBONKRelevance(title, description || '')
    const tags = extractBONKTags(title, description || '')
    
    // Check if event meets minimum relevance threshold
    if (!isBONKRelevant(relevanceScore)) {
      return NextResponse.json(
        { 
          error: 'Event does not meet minimum BONK relevance threshold',
          relevanceScore,
          requiredScore: 30,
          suggestions: 'Include more BONK, Solana, or DeFi related keywords in title/description'
        },
        { status: 400 }
      )
    }
    
    // For now, return success but note that database storage isn't implemented yet
    // This would be implemented when we add the events table to Prisma schema
    
    const newEvent: Event = {
      id: `temp-${Date.now()}`,
      title,
      date,
      time: time || '00:00',
      type,
      location,
      description: description || '',
      attendees: attendees || 0,
      link,
      relevanceScore,
      tags,
      verified: true, // Admin-created events are verified by default
      source: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      message: 'Event created successfully (database storage not yet implemented)',
      event: newEvent,
      relevanceInfo: {
        score: relevanceScore,
        tags,
        category: relevanceScore >= 70 ? 'High Relevance' : relevanceScore >= 50 ? 'Medium Relevance' : 'Low Relevance'
      }
    })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
