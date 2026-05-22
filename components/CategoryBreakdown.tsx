import type { Category } from "@/lib/categories";

interface Props {
  byCategory: Array<{ category: Category; weight: number; wV: number; trades: number }>;
  totalWeightedVolume: number;
}

const CATEGORY_COLOR: Record<Category, string> = {
  Sports: "#86efac",
  Politics: "#fda4af",
  Finance: "#fbbf24",
  Mentions: "#a5b4fc",
  Tech: "#67e8f9",
  Economics: "#f0abfc",
  Culture: "#fdba74",
  Weather: "#bef264",
  Other: "#94a3b8",
  Crypto: "#fb923c",
  Geopolitics: "#52525b",
};

const fmtUsd = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(2)}`;

export function CategoryBreakdown({ byCategory, totalWeightedVolume }: Props) {
  if (byCategory.length === 0) {
    return (
      <div className="bg-ink-800 border border-ink-600 rounded-xl p-6">
        <p className="text-zinc-500 text-sm">No taker trades found in the last 30 days.</p>
      </div>
    );
  }

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-sm uppercase tracking-[0.2em] text-zinc-400">By category</h3>
        <span className="text-xs text-zinc-600 font-mono">weighted volume earned</span>
      </div>

      <div className="space-y-4">
        {byCategory.map(({ category, weight, wV, trades }) => {
          const pct = totalWeightedVolume > 0 ? (wV / totalWeightedVolume) * 100 : 0;
          const color = CATEGORY_COLOR[category];
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-zinc-200">{category}</span>
                  <span className="text-zinc-600 text-xs font-mono">×{weight.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-4 font-mono tnum">
                  <span className="text-zinc-500 text-xs">{trades} trades</span>
                  <span className="text-zinc-200 w-20 text-right">{fmtUsd(wV)}</span>
                  <span className="text-zinc-500 text-xs w-12 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-1 bg-ink-600 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
