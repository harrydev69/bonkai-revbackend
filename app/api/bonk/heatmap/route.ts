import { NextResponse } from 'next/server';
import { getBonkHourlyMarketChart } from '@/lib/coingecko';
import { buildHeatmap } from '@/lib/heatmap';

export const revalidate = 300; // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get('days') || 30);

    const chart = await getBonkHourlyMarketChart(days);
    const payload = buildHeatmap(chart.total_volumes);

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300' },
    });
  } catch (err: any) {
    // Optionally return a 200 with last-good snapshot from KV/Supabase
    return NextResponse.json({ error: err?.message || 'Heatmap failed' }, { status: 502 });
  }
}
