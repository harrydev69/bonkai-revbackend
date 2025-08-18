# BONKai - BONK Analytics Platform

A comprehensive analytics platform for the BONK ecosystem, built with Next.js, TypeScript, and real-time blockchain data.

## 🚀 Recent Updates

### ✅ Implemented Real Data Sources
- **Blockchain Analytics API** (`/api/blockchain/analytics`) - Real-time Solana metrics, TVL, user activity
- **Events API** (`/api/events`) - Dynamic event management with Google Calendar integration
- **Audio Library API** (`/api/audio`) - Streaming audio with AWS S3 support
- **Feature Flags System** - Conditional rendering based on API availability

### 🔧 Replaced Static Data
- **Analytics Dashboard**: Now fetches real blockchain metrics from Solana RPC
- **Event Calendar**: Dynamic events from Google Calendar API or database
- **Audio Library**: Real streaming audio with play/like tracking
- **Performance Metrics**: Live trading performance and risk metrics

## 🏗️ Architecture

### API Routes
```
/api/
├── blockchain/analytics    # Real-time blockchain metrics
├── events                  # Event management
├── audio                   # Audio library & streaming
├── bonk/                   # BONK-specific data
├── tokens/                 # Token analytics
├── sentiment/              # Market sentiment
├── news/                   # Crypto news
└── solana/                 # Solana blockchain data
```

### Data Sources
- **Solana RPC** (via Helius) - Network metrics, TPS, validators
- **CoinGecko** - Market data and rankings
- **CoinMarketCap** - Price and volume data
- **Messari** - Asset metrics and analytics
- **LunarCrush** - Social sentiment data
- **Google Calendar** - Event management
- **AWS S3** - Audio file storage and streaming

## 🚀 Quick Start

### 1. Environment Setup
Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"
DIRECT_URL="your-direct-database-connection"

# Solana
HELIUS_API_KEY="your-helius-api-key"
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"

# API Keys
COINGECKO_API_KEY="your-coingecko-pro-key"
COINMARKETCAP_API_KEY="your-cmc-key"
MESSARI_API_KEY="your-messari-key"
LUNARCRUSH_API_KEY="your-lunarcrush-key"

# Optional Integrations
GOOGLE_CALENDAR_API_KEY="your-google-calendar-key"
GOOGLE_CALENDAR_ID="your-calendar-id"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-audio-bucket"
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

## 🔑 Required API Keys

### Essential (Core Functionality)
- **Helius API Key** - Solana RPC access
- **CoinGecko Pro** - Market data
- **CoinMarketCap** - Price analytics
- **Messari** - Asset metrics

### Optional (Enhanced Features)
- **Google Calendar** - Event management
- **AWS S3** - Audio streaming
- **Dune Analytics** - Advanced blockchain metrics
- **Flipside** - User analytics
- **Solscan** - Transaction data

## 📊 Features

### Real-Time Analytics Dashboard
- **TVL Tracking**: Live Total Value Locked metrics
- **User Activity**: Active users and transaction counts
- **Network Health**: Solana uptime, TPS, validator count
- **Performance Metrics**: Win rate, Sharpe ratio, risk metrics

### Dynamic Event Calendar
- **Google Calendar Integration**: Sync with external calendars
- **Event Management**: Add/edit events via API
- **Recurring Events**: Support for recurring event patterns
- **Real-time Updates**: Auto-refresh every 10 minutes

### Streaming Audio Library
- **AWS S3 Integration**: Host actual audio files
- **Play Tracking**: Real-time play count updates
- **Like System**: User engagement tracking
- **Search & Categories**: Advanced content discovery

### Feature Flags
- **Conditional Rendering**: Hide unfinished features
- **API Availability**: Check service status
- **Graceful Degradation**: Fallback to placeholder data

## 🛠️ Development

### Adding New Data Sources
1. Create API route in `/app/api/`
2. Add environment variable for API key
3. Update feature flags in `/lib/feature-flags.ts`
4. Add error handling and fallbacks

### Error Handling
- **Error Boundaries**: Catch React component errors
- **API Fallbacks**: Graceful degradation when services fail
- **User Feedback**: Clear error messages and recovery options

### Testing
```bash
# Run tests
npm test

# Check types
npm run type-check

# Lint code
npm run lint
```

## 📈 Performance

### Caching Strategy
- **API Response Caching**: 5-15 minute refresh intervals
- **Static Generation**: Pre-render stable content
- **Incremental Updates**: Real-time data where needed

### Optimization
- **Lazy Loading**: Load components on demand
- **Image Optimization**: Next.js Image component
- **Bundle Splitting**: Code splitting for better performance

## 🚨 Troubleshooting

### Common Issues

#### API Key Errors
```bash
# Check environment variables
echo $COINGECKO_API_KEY

# Verify .env.local file
cat .env.local
```

#### Database Connection
```bash
# Test database connection
npx prisma db pull

# Reset database
npx prisma db push --force-reset
```

#### Solana RPC Issues
```bash
# Test Helius connection
curl -X POST "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Debug Mode
Set `NODE_ENV=development` to see detailed error information and API response logs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add error boundaries for new features
- Include loading states and error handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **BONK Community** - For inspiration and feedback
- **Solana Foundation** - For blockchain infrastructure
- **Next.js Team** - For the amazing framework
- **Vercel** - For hosting and deployment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/bonkai/issues)
- **Discord**: [BONK Community](https://discord.gg/bonk)
- **Email**: support@bonkai.com

---

**BONKai** - Making BONK analytics accessible to everyone! 🚀🐕
