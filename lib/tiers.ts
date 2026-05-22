// Tier thresholds and rebate rates, copied verbatim from
// https://docs.polymarket.com/trading/taker-rebates

export type TierId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Tier {
  id: TierId;
  name: string;
  threshold: number; // 30-day Weighted Volume needed (USD)
  rebate: number; // decimal, e.g. 0.18 = 18%
  bonus: number; // one-time level-up bonus (USD)
  color: string; // tailwind token (e.g. "gold")
  hex: string; // raw hex for inline styles
}

export const TIERS: Tier[] = [
  { id: 0, name: "None",     threshold: 0,           rebate: 0.00, bonus: 0,     color: "ink-400",  hex: "#3A4150" },
  { id: 1, name: "Bronze",   threshold: 2_000,       rebate: 0.03, bonus: 10,    color: "bronze",   hex: "#CD7F32" },
  { id: 2, name: "Silver",   threshold: 20_000,      rebate: 0.08, bonus: 50,    color: "silver",   hex: "#C0C5CE" },
  { id: 3, name: "Gold",     threshold: 200_000,     rebate: 0.18, bonus: 250,   color: "gold",     hex: "#E5B649" },
  { id: 4, name: "Platinum", threshold: 1_000_000,   rebate: 0.32, bonus: 1_500, color: "platinum", hex: "#E8EAED" },
  { id: 5, name: "Diamond",  threshold: 4_000_000,   rebate: 0.44, bonus: 7_500, color: "diamond",  hex: "#6FD3F7" },
  { id: 6, name: "Obsidian", threshold: 10_000_000,  rebate: 0.50, bonus: 25_000,color: "obsidian", hex: "#7C5CFC" },
];

export function tierForVolume(wV: number): Tier {
  let current: Tier = TIERS[0];
  for (const t of TIERS) {
    if (wV >= t.threshold) current = t;
  }
  return current;
}

export function nextTier(currentId: TierId): Tier | null {
  if (currentId >= 6) return null;
  return TIERS[currentId + 1];
}

export function progressToNext(wV: number): {
  current: Tier;
  next: Tier | null;
  pct: number; // 0..1 progress within the current band
  remaining: number; // $ wV needed to hit next tier (0 if at top)
} {
  const current = tierForVolume(wV);
  const next = nextTier(current.id);
  if (!next) {
    return { current, next: null, pct: 1, remaining: 0 };
  }
  const bandSize = next.threshold - current.threshold;
  const inBand = wV - current.threshold;
  return {
    current,
    next,
    pct: Math.max(0, Math.min(1, inBand / bandSize)),
    remaining: Math.max(0, next.threshold - wV),
  };
}
