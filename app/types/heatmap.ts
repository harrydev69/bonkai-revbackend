export type HeatBucket = {
  dow: number;          // 0=Sun ... 6=Sat (UTC)
  hour: number;         // 0..23 (UTC)
  totalUsd: number;     // sum over the window
  count: number;        // # of hourly points that landed in this bucket
  avgUsd: number;       // totalUsd / count
  intensity: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
};

export type HeatmapPayload = {
  windowHours: number;      // e.g. ~720 for 30 days
  totalUsd: number;         // sum of all hourly volumes in the window
  avgPerHour: number;       // totalUsd / windowHours
  peakHourUTC: number;      // 0..23 hour with highest avg
  thresholds: { q20: number; q40: number; q60: number; q80: number };
  buckets: HeatBucket[];    // 7 * 24 = 168 buckets
};
