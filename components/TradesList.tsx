import type { EnrichedTrade } from "@/app/api/rebates/route";

interface Props {
  trades: EnrichedTrade[];
}

const fmtUsd = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(2)}K` : `$${n.toFixed(2)}`;

const fmtTime = (sec: number) => {
  const d = new Date(sec * 1000);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export function TradesList({ trades }: Props) {
  if (trades.length === 0) return null;

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-ink-600 flex items-baseline justify-between">
        <h3 className="text-sm uppercase tracking-[0.2em] text-zinc-400">Recent taker trades</h3>
        <span className="text-xs text-zinc-600 font-mono">last {trades.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-zinc-500 border-b border-ink-600">
              <th className="text-left px-6 py-3 font-normal">When</th>
              <th className="text-left px-2 py-3 font-normal">Market</th>
              <th className="text-left px-2 py-3 font-normal">Side</th>
              <th className="text-left px-2 py-3 font-normal">Cat.</th>
              <th className="text-right px-2 py-3 font-normal">Price</th>
              <th className="text-right px-2 py-3 font-normal">Size</th>
              <th className="text-right px-6 py-3 font-normal">wV</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr
                key={`${t.txHash}-${i}`}
                className="border-b border-ink-700 hover:bg-ink-700/50 transition-colors"
              >
                <td className="px-6 py-3 text-zinc-500 font-mono tnum text-xs whitespace-nowrap">
                  {fmtTime(t.timestamp)}
                </td>
                <td className="px-2 py-3 max-w-xs">
                  
                    href={`https://polymarket.com/event/${t.eventSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 hover:text-accent truncate block"
                    title={t.title}
                  >
                    {t.title}
                  </a>
                  <span className="text-xs text-zinc-600">{t.outcome}</span>
                </td>
                <td className="px-2 py-3">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded ${
                      t.side === "BUY"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {t.side}
                  </span>
                </td>
                <td className="px-2 py-3 text-zinc-500 text-xs">{t.category}</td>
                <td className="px-2 py-3 text-right font-mono tnum text-zinc-300">
                  {(t.price * 100).toFixed(1)}¢
                </td>
                <td className="px-2 py-3 text-right font-mono tnum text-zinc-300">
                  {fmtUsd(t.tradeSizeUsd)}
                </td>
                <td className="px-6 py-3 text-right font-mono tnum text-zinc-100">
                  {fmtUsd(t.wV)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
