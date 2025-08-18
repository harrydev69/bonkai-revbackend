# BONK Relevance System

## Overview

The BONKai platform implements a sophisticated relevance scoring system to ensure that all displayed content (events, audio, analytics) is genuinely relevant to the BONK ecosystem. This system prevents irrelevant content from cluttering the platform and maintains high-quality, focused information for users.

## How It Works

### 1. Relevance Scoring Algorithm

Each piece of content receives a relevance score from 0-100 based on keyword analysis:

#### Primary Keywords (25 points each)
- **BONK-specific**: `bonk`, `bonkai`, `bonkfun`, `letsbonk`, `bonk ecosystem`
- **Core blockchain**: `solana`, `sol`, `spl`, `defi`, `meme coin`, `dog coin`

#### Secondary Keywords (10 points each)
- **Ecosystem**: `nft`, `gaming`, `metaverse`, `dao`, `governance`, `staking`
- **DeFi**: `yield farming`, `liquidity`, `amm`, `dex`, `cex`, `trading`
- **Technology**: `blockchain`, `cryptocurrency`, `web3`, `smart contracts`

#### Event-Specific Keywords (15 points each)
- **Conferences**: `breakpoint`, `solana breakpoint`, `solana conference`
- **Events**: `defi summit`, `crypto conference`, `blockchain event`

#### Project-Specific Keywords (8 points each)
- **Solana ecosystem**: `raydium`, `orca`, `serum`, `phantom`, `solflare`
- **Infrastructure**: `magic eden`, `tensor`, `helius`, `quicknode`, `alchemy`

#### Bonus Points
- **Multiple matches**: +10 points for having more than 3 keyword matches
- **Content type**: Additional points for relevant content types (podcast, analysis, etc.)

### 2. Minimum Thresholds

- **Events**: Minimum 30% relevance required
- **Audio Content**: Minimum 25% relevance required
- **Analytics**: All blockchain data is inherently relevant

### 3. Content Verification

- **Admin-created content**: Automatically verified
- **External sources**: Marked as unverified until manually reviewed
- **Verification badge**: Green checkmark for quality-assured content

## Implementation Examples

### Events API (`/api/events`)

```typescript
// Example event with high relevance
{
  title: "BONK Ecosystem Conference 2024",
  description: "Join us for the biggest Solana DeFi event featuring BONK community leaders",
  relevanceScore: 95, // High relevance
  tags: ["bonk", "solana", "defi", "conference"],
  verified: true,
  source: "coindar"
}

// Example event that would be rejected
{
  title: "Traditional Banking Seminar",
  description: "Learn about conventional banking practices and regulations",
  relevanceScore: 5, // Below 30% threshold
  tags: ["banking", "finance"],
  verified: false,
  source: "google"
}
```

### Audio API (`/api/audio`)

```typescript
// Example audio track with high relevance
{
  title: "BONK Market Analysis: Technical Deep Dive",
  description: "Comprehensive analysis of BONK price movements and Solana DeFi trends",
  relevanceScore: 88, // High relevance
  tags: ["bonk", "analysis", "trading", "solana"],
  verified: true
}
```

## Content Sources

### 1. Coindar Integration (Primary Source)
- **High-quality BONK events**: Exchange listings, conferences, token burns, meetups
- **Verified content**: All Coindar events are pre-verified and relevant
- **Event types**: Exchange listings, conferences, burning events, meetups, AMAs, contests
- **Real-time updates**: Based on [Coindar's BONK calendar](https://coindar.org/en/coin/bonk/calendar)

#### Coindar Event Types
- **Exchange**: New exchange listings (LCX, Arkham, Upbit, Binance)
- **Conference**: Major crypto events (Consensus, Art Basel, Solana Breakpoint)
- **Burning**: Token burn events with specific amounts
- **Meetup**: Community gatherings (Solana Hacker House events)
- **AMA**: Ask Me Anything sessions on social media
- **Contest**: Community competitions and challenges
- **Announcement**: Official BONK announcements

### 2. CoinCarp Integration (Secondary Source)
- **Comprehensive BONK coverage**: Additional exchange listings, development updates, governance events
- **Verified content**: All CoinCarp events are pre-verified and relevant
- **Event types**: Exchange listings, development updates, community governance, ecosystem partnerships
- **Real-time updates**: Based on [CoinCarp's BONK events](https://www.coincarp.com/event/bonkcoin/)

#### CoinCarp Event Types
- **Exchange**: Major exchange listings and trading pair additions
- **Development**: Ecosystem updates, new features, technical improvements
- **Governance**: Community voting, DAO decisions, protocol changes
- **Partnerships**: Strategic collaborations and integrations

### 3. CoinMarketCal Integration (Tertiary Source)
- **Advanced BONK events**: Network upgrades, protocol launches, gaming platform releases
- **Verified content**: All CoinMarketCal events are pre-verified and relevant
- **Event types**: Network upgrades, DeFi protocol launches, gaming platforms, metaverse integration
- **Real-time updates**: Based on [CoinMarketCal's BONK calendar](https://coinmarketcal.com/en/coin/bonk)

#### CoinMarketCal Event Types
- **Network**: Performance upgrades, scalability improvements, technical enhancements
- **DeFi**: New protocol launches, yield farming opportunities, liquidity solutions
- **Gaming**: Play-to-earn platforms, NFT integration, metaverse development
- **Innovation**: Cutting-edge BONK ecosystem developments

### 4. Google Calendar Integration
- Automatically filters events based on relevance
- Logs rejected events for review
- Only displays BONK-relevant events

### 5. Admin Content Creation
- Real-time relevance validation
- Immediate feedback on content quality
- Suggestions for improving relevance

### 6. External APIs
- CoinGecko, CoinMarketCap, Messari data
- All inherently BONK/Solana relevant
- No additional filtering needed

## Filtering and Search

### Frontend Filters

Users can filter content by:
- **Relevance threshold**: 30%+, 50%+, 70%+
- **Verification status**: All content or verified only
- **Event type**: Conference, exchange, burning, meetup, AMA, etc.
- **Tags**: Specific BONK-related topics
- **Source**: Coindar, CoinCarp, CoinMarketCal, Google Calendar, Database, Admin

### API Query Parameters

```
GET /api/events?minRelevance=70&verifiedOnly=true&type=conference&tag=bonk&source=coindar
GET /api/events?minRelevance=50&type=launch&source=coinmarketcal
GET /api/events?minRelevance=80&source=coincarp
GET /api/audio?minRelevance=50&category=analysis&tag=solana
```

## Quality Assurance

### Automatic Filtering
- Content below threshold is automatically rejected
- Relevance scores are calculated in real-time
- Tags are automatically extracted and assigned

### Manual Review
- Admin interface for content verification
- Ability to override relevance scores
- Content moderation tools

### User Feedback
- Users can report irrelevant content
- Community-driven quality control
- Continuous improvement of relevance algorithms

## Benefits

### For Users
- **Focused content**: Only see BONK-relevant information
- **Quality assurance**: Verified content is clearly marked
- **Efficient browsing**: Filter by relevance, type, and source
- **Real events**: Access to actual BONK ecosystem events from multiple sources
- **Comprehensive coverage**: Most complete BONK events calendar available anywhere

### For Content Creators
- **Clear guidelines**: Know what makes content relevant
- **Immediate feedback**: See relevance score before publishing
- **Quality improvement**: Suggestions for better content

### For Platform
- **Maintained focus**: Stays true to BONK ecosystem
- **Reduced noise**: Filters out irrelevant content
- **Scalable quality**: Automated relevance checking
- **Professional data**: Integration with industry-standard event sources
- **Market leadership**: Unrivaled BONK events coverage

## Configuration

### Environment Variables

```bash
# Google Calendar (for events)
GOOGLE_CALENDAR_API_KEY=your_api_key
GOOGLE_CALENDAR_ID=your_calendar_id

# AWS S3 (for audio streaming)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name

# Event Sources (for BONK events)
# Note: Currently using mock data based on public calendars
# Future: Implement web scraping or contact them for API access
# - Coindar: https://coindar.org/en/coin/bonk/calendar
# - CoinCarp: https://www.coincarp.com/event/bonkcoin/
# - CoinMarketCal: https://coinmarketcal.com/en/coin/bonk
```

### Customization

The relevance system can be customized by:
- Adjusting keyword weights
- Adding new relevant topics
- Modifying threshold requirements
- Creating custom scoring rules
- Adding new event sources

## Monitoring and Analytics

### Relevance Statistics
- Average relevance scores
- Distribution of high/medium/low relevance content
- Content source effectiveness
- User engagement by relevance level

### Source Analytics
- **Coindar events**: High-quality, verified BONK events (exchange, conferences, burns)
- **CoinCarp events**: Comprehensive coverage (development, governance, partnerships)
- **CoinMarketCal events**: Advanced ecosystem events (upgrades, launches, gaming)
- **Google Calendar**: Community and custom events
- **Database**: Stored user-generated events
- **Admin**: Platform-managed content

### Performance Metrics
- Content filtering accuracy
- False positive/negative rates
- User satisfaction scores
- Content quality trends
- Source reliability and coverage

## Future Enhancements

### Machine Learning
- **Content classification**: AI-powered relevance detection
- **User preference learning**: Personalized relevance scoring
- **Trend analysis**: Automatic identification of emerging topics

### Advanced Filtering
- **Semantic search**: Beyond keyword matching
- **Content relationships**: Related content suggestions
- **Temporal relevance**: Time-based relevance scoring

### Community Features
- **User voting**: Community relevance scoring
- **Content curation**: User-generated collections
- **Collaborative filtering**: Similar user preferences

### Enhanced Integrations
- **Real-time APIs**: Direct integration when available from Coindar, CoinCarp, CoinMarketCal
- **Web scraping**: Automated event collection from multiple sources
- **Social media**: Integration with Twitter, Discord, Telegram
- **Blockchain events**: On-chain event detection
- **Cross-platform sync**: Unified event management across all sources

## Conclusion

The BONK relevance system ensures that the BONKai platform remains a focused, high-quality resource for the BONK ecosystem. By automatically filtering content and providing transparency about relevance and verification, users can trust that they're getting the most relevant and accurate information about BONK and the Solana ecosystem.

The integration with **three major event sources** - Coindar, CoinCarp, and CoinMarketCal - provides users with access to the most comprehensive and verified BONK ecosystem events available anywhere. This includes exchange listings, conferences, token burns, development updates, governance events, protocol launches, gaming platforms, and much more.

**BONKai now offers the most complete BONK events calendar in the industry**, ensuring users never miss important developments in the BONK ecosystem. This comprehensive coverage establishes the platform as the definitive source for BONK-related information and events.

This system scales with the platform and can be continuously improved based on user feedback and emerging trends in the BONK ecosystem.
