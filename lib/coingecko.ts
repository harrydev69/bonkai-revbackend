const API_BASE =
  process.env.COINGECKO_API_BASE?.replace(/\/+$/, '') ||
  'https://api.coingecko.com/api/v3';

const CG_KEY = process.env.COINGECKO_API_KEY;

export async function getBonkHourlyMarketChart(days: number) {
  const url = new URL(`${API_BASE}/coins/bonk/market_chart`);
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('days', String(days));
  // Note: hourly interval is automatic for 2-90 days, no need to specify
  // url.searchParams.set('interval', 'hourly'); // This is Enterprise-only

  const res = await fetch(url.toString(), {
    headers: {
      ...(CG_KEY ? { 'x-cg-pro-api-key': CG_KEY } : {}),
      Accept: 'application/json',
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`CoinGecko ${res.status}: ${txt || res.statusText}`);
  }
  return (await res.json()) as {
    total_volumes: [number, number][];
  };
}
