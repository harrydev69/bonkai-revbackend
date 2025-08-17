// app/lib/format.ts
function isNum(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

// Dynamic USD formatter for micro prices
export function fmtUSD(value?: number, max = 8): string {
  if (!isNum(value)) return "—";
  if (Object.is(value, -0)) value = 0; // avoid "-$0.00"

  // choose fraction digits by magnitude
  let minimumFractionDigits = 2;
  let maximumFractionDigits = Math.min(Math.max(minimumFractionDigits, max), 12);

  const abs = Math.abs(value);
  if (abs === 0) {
    minimumFractionDigits = 2;
    maximumFractionDigits = 2;
  } else if (abs < 0.000001) {
    minimumFractionDigits = 8;
    maximumFractionDigits = Math.max(maximumFractionDigits, 8);
  } else if (abs < 0.0001) {
    minimumFractionDigits = 7;
  } else if (abs < 0.001) {
    minimumFractionDigits = 6;
  } else if (abs < 0.01) {
    minimumFractionDigits = 5;
  } else if (abs < 1) {
    minimumFractionDigits = 4;
  } else if (abs < 1000) {
    minimumFractionDigits = 2;
  } else {
    minimumFractionDigits = 0;
    maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export function compactUSD(value?: number): string {
  if (!isNum(value)) return "—";
  if (Object.is(value, -0)) value = 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function fmtPct(value?: number, digits = 2): string {
  if (!isNum(value)) return "—";
  // normalize -0.00 to +0.00
  const v = Math.abs(value) < 1e-12 ? 0 : value;
  const sign = v > 0 ? "+" : v < 0 ? "" : ""; // show "+" for positives
  return `${sign}${v.toFixed(digits)}%`;
}
