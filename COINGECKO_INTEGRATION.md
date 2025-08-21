# 🪙 CoinGecko Widget Integration

## Overview
The BONKai platform now integrates with CoinGecko's live price ticker widget to display real-time cryptocurrency prices in the top navigation bar.

## Features
- **Live Price Updates**: Real-time price data from CoinGecko
- **Multiple Tokens**: Displays 15 BONK ecosystem and related tokens
- **Responsive Design**: Adapts to different screen sizes
- **Theme Support**: Automatically adapts to light/dark themes
- **Error Handling**: Graceful fallback if widget fails to load

## Integrated Tokens
The widget displays the following tokens:
1. **BONK** - Main token
2. **USELESS** - Useless token
3. **BUCKY** - Bucky token
4. **ANI GROK COMPANION** - AI companion token
5. **KORI** - Kori token
6. **HODL COIN** - HODL token
7. **HOSICO CAT** - Cat-themed token
8. **RHETOR** - Rhetor token
9. **NYLA AI** - AI token
10. **JUST MEMECOIN** - Meme token
11. **SOLANA STOCK INDEX** - Solana index
12. **MOMO** - Momo token
13. **MONKEY THE PICASSO** - Art-themed token
14. **SOLANA** - SOL token

## Technical Implementation

### Component Location
- **File**: `app/components/bonk-ecosystem-ticker.tsx`
- **Usage**: Imported in `app/components/main-content.tsx`

### Script Loading
- Dynamically loads CoinGecko widget script
- Handles loading states and errors
- Automatic cleanup on component unmount

### TypeScript Support
- Custom type declarations in `app/types/coingecko.d.ts`
- Proper JSX element typing for the widget

### Styling
- Custom CSS variables for theme integration
- Responsive design with Tailwind CSS
- Gradient background matching BONKai brand

## Configuration

### Widget Attributes
```html
<gecko-coin-price-marquee-widget 
  locale="en" 
  transparent-background="true" 
  coin-ids="bonk,useless-3,bucky-2,ani-grok-companion,kori,hodl-coin,hosico-cat,rhetor,nyla-ai,just-memecoin,solana-stock-index,momo-3,monkey-the-picasso,solana" 
  initial-currency="usd"
/>
```

### Next.js Configuration
- CSP headers allow CoinGecko scripts
- Optimized for performance and security

## Benefits
1. **Real-time Data**: Live price updates from reliable source
2. **Reduced Maintenance**: No need to manage mock data
3. **Professional Look**: Industry-standard price ticker
4. **User Trust**: Data from reputable cryptocurrency platform
5. **Performance**: Lightweight external widget
6. **Broader Coverage**: Includes more ecosystem tokens and SOL

## Future Enhancements
- Add more ecosystem tokens
- Customize widget appearance further
- Add price alert functionality
- Integrate with user preferences
- Add historical price charts

## Troubleshooting
- **Widget not loading**: Check network connectivity and CSP headers
- **Script errors**: Verify script URL accessibility
- **Styling issues**: Check CSS custom properties
- **Performance**: Monitor script loading times
