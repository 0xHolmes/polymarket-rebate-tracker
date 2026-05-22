import type { Tier } from "@/lib/tiers";

interface Props {
  current: Tier;
  next: Tier | null;
  pct: number;
  remaining: number;
  totalWeightedVolume: number;
}

const fmtUsd = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(2)}`;

const fmtUsdExact = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function TierCard({ current, next, pct, remaining, totalWeightedVolume }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-ink-800 border border-ink-600 p-8 tier-glow"
      style={{ ["--glow" as string]: `${current.hex}55` }}
    >
      {/* Tier color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${current.hex}, transparent)` }}
      />

      <div className="flex items-start justify-between flex-wrap gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Current tier</p>
          <h2
            className="font-display text-6xl sm:text-7xl font-light leading-none"
            style={{ color: current.hex }}
          >
            {current.name}
          </h2>
          <p className="text-zinc-500 text-sm mt-3 font-mono">
            Tier {current.id} · {(current.rebate * 100).toFixed(0)}% rebate
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">30-day wV</p>
          <p className="font-mono text-3xl sm:text-4xl tnum font-light">
            {fmtUsd(totalWeightedVolume)}
          </p>
          <p className="text-zinc-600 text-xs mt-1 font-mono">
            {fmtUsdExact(totalWeightedVolume)}
          </p>
        </div>
      </div>

      {/* Progress to next */}
      {next ? (
        <div className="mt-10">
          <div className="flex justify-between items-baseline mb-3 text-sm">
            <span className="text-zinc-400">
              Next: <span className="font-medium" style={{ color: next.hex }}>{next.name}</span>
              <span className="text-zinc-600 ml-2 font-mono">
                ({(next.rebate * 100).toFixed(0)}% rebate)
              </span>
            </span>
            <span className="font-mono tnum text-zinc-300">
              {fmtUsd(remaining)} <span className="text-zinc-600">to go</span>
            </span>
          </div>

          <div className="relative h-2 bg-ink-600 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-full"
              style={{
                width: `${pct * 100}%`,
                background: `linear-gradient(90deg, ${current.hex}, ${next.hex})`,
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-zinc-600 font-mono">
            <span>{fmtUsd(current.threshold)}</span>
            <span>{fmtUsd(next.threshold)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center py-4 border-t border-ink-600">
          <p className="font-display text-2xl" style={{ color: current.hex }}>
            Maxed out.
          </p>
          <p className="text-zinc-500 text-sm mt-1">You're earning the top 50% rebate on every taker trade.</p>
        </div>
      )}
    </div>
  );
}
