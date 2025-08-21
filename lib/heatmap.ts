import type { HeatBucket, HeatmapPayload } from '@/app/types/heatmap';

function initBuckets(): HeatBucket[] {
  const buckets: HeatBucket[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      buckets.push({ dow, hour, totalUsd: 0, count: 0, avgUsd: 0, intensity: 'low' });
    }
  }
  return buckets;
}

export function buildHeatmap(totalVolumes: [number, number][]): HeatmapPayload {
  const buckets = initBuckets();

  // Fill buckets using UTC day-of-week and hour
  let totalUsd = 0;
  for (const [ts, volUsd] of totalVolumes) {
    if (volUsd == null || !isFinite(volUsd)) continue;
    const d = new Date(ts);
    const dow = d.getUTCDay();     // 0..6 (Sun..Sat)
    const hour = d.getUTCHours();  // 0..23
    const idx = dow * 24 + hour;
    buckets[idx].totalUsd += volUsd;
    buckets[idx].count += 1;
    totalUsd += volUsd;
  }

  // Compute averages
  for (const b of buckets) {
    b.avgUsd = b.count ? b.totalUsd / b.count : 0;
  }

  // Compute quantile thresholds from non-zero averages
  const avgs = buckets.map(b => b.avgUsd).filter(v => v > 0).sort((a,b)=>a-b);
  const q = (p: number) => avgs.length ? avgs[Math.floor((avgs.length - 1) * p)] : 0;
  const q20 = q(0.20), q40 = q(0.40), q60 = q(0.60), q80 = q(0.80);

  // Assign intensity by avgUsd vs quantiles
  for (const b of buckets) {
    const v = b.avgUsd;
    b.intensity =
      v <= q20 ? 'very_low' :
      v <= q40 ? 'low' :
      v <= q60 ? 'medium' :
      v <= q80 ? 'high' : 'very_high';
  }

  // Find peak hour across week by average
  let peakHourUTC = 0;
  let best = -1;
  for (let h = 0; h < 24; h++) {
    const hourAvg = buckets
      .filter(b => b.hour === h)
      .reduce((s, b) => s + b.avgUsd, 0) / 7;
    if (hourAvg > best) { best = hourAvg; peakHourUTC = h; }
  }

  return {
    windowHours: totalVolumes.length,
    totalUsd,
    avgPerHour: totalVolumes.length ? totalUsd / totalVolumes.length : 0,
    peakHourUTC,
    thresholds: { q20, q40, q60, q80 },
    buckets,
  };
}
