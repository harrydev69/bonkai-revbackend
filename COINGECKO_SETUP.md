# 🪙 **COINGECKO SETUP - QUICK START**

## 🚀 **IMMEDIATE SETUP**

### **1. Create Environment File (Optional)**
Create `.env.local` in your project root:
```bash
# Option 1: With API key (recommended for higher rate limits)
COINGECKO_API_KEY=your_api_key_here

# Option 2: Without API key (standard rate limits)
# Leave COINGECKO_API_KEY empty or remove the line
```

### **2. Get API Key (Optional)**
- Visit: https://www.coingecko.com/en/api/pricing
- Choose Free tier (50 calls/minute, 10,000 calls/month)
- Copy your API key
- **Note**: API key is optional but recommended for higher rate limits

### **3. Restart Server**
```bash
npm run dev
```

---

## ✅ **WHAT'S READY**

- **Volume Heatmap Component** - Fully integrated with CoinGecko
- **Real BONK Data** - Live trading volumes from market chart API (automatic hourly data)
- **Multiple Timeframes** - 7, 14, 30, 90 days
- **Professional UI** - Interactive heatmap with tooltips
- **Data Export** - CSV download functionality
- **No API Key Required** - Works out of the box with standard rate limits

---

## 🔧 **API ENDPOINT**

```
GET /api/bonk/heatmap?days=30
```

**Response**: Real BONK volume data in 7×24 hour buckets (UTC)

**Note**: Works with or without API key. With key: higher rate limits, without key: standard limits

---

## 🎯 **NEXT STEPS**

1. **Test the heatmap** at `/dashboard` (works immediately!)
2. **Optional**: Add API key to `.env.local` for higher rate limits
3. **Enjoy real data** instead of mock values!

---

## 🚨 **TROUBLESHOOTING**

### **"CoinGecko Pro API required" Error**
- **Solution**: Remove COINGECKO_API_KEY from environment or get valid key
- **Free tier**: 50 calls/minute, 10,000 calls/month
- **Get key**: https://www.coingecko.com/en/api/pricing

### **"API key invalid" Error**
- **Check**: Your `.env.local` file has the correct key
- **Format**: `COINGECKO_API_KEY=your_actual_key_here`
- **Restart**: Development server after adding the key

### **"Rate limit exceeded" Error**
- **Free tier limit**: 50 calls per minute
- **Solution**: Wait 1 minute before retrying
- **Upgrade**: Consider Pro tier for higher limits

---

**The Volume Heatmap is now fully wired to CoinGecko! 🚀📊**
