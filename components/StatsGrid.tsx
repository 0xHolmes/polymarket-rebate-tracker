import type { Tier } from "@/lib/tiers";

interface Props {
  totalTrades: number;
  totalNotionalUsd: number;
  current: Tier;
  next: Tier | null;
}

const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-2">{label}</p>
      <p className="font-mono text-2xl tnum font-light">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}

export function StatsGrid({ totalTrades, totalNotionalUsd, current, next }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat label="Taker trades" value={totalTrades.toLocaleString()} sub="last 30 days" />
      <Stat label="Notional traded" value={fmtUsd(totalNotionalUsd)} sub="shares × price, USD" />
      <Stat
        label="Current rebate"
        value={`${(current.rebate * 100).toFixed(0)}%`}
        sub={current.id === 0 ? "no rebate yet" : `paid daily in pUSD`}
      />
      <Stat
        label="Next level bonus"
        value={next ? fmtUsd(next.bonus) : "—"}
        sub={next ? `one-time, reach ${next.name}` : "max tier reached"}
      />
    </div>
  );
}
