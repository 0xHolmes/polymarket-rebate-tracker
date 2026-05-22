"use client";

import { useEffect, useState } from "react";
import { WalletInput } from "@/components/WalletInput";
import { TierCard } from "@/components/TierCard";
import { StatsGrid } from "@/components/StatsGrid";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { TradesList } from "@/components/TradesList";
import type { RebateResponse } from "@/app/api/rebates/route";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [data, setData] = useState<RebateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pull initial address from URL hash so traders can share a link
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "").trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(hash)) {
      setAddress(hash);
      void load(hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(addr: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/rebates?address=${addr}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setData(json as RebateResponse);
      window.location.hash = addr;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (addr: string) => {
    setAddress(addr);
    void load(addr);
  };

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12 max-w-6xl mx-auto">
      <header className="mb-12 animate-fade-up">
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse-slow"
            aria-hidden
          />
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Polymarket · Taker Tier Tracker
          </span>
        </div>
        <h1 className="font-display text-5xl sm:text-7xl font-light leading-[0.95] mt-4 max-w-3xl">
          Track your{" "}
          <span className="italic" style={{ color: "#E5B649" }}>
            rebate
          </span>{" "}
          in real time.
        </h1>
        <p className="text-zinc-400 mt-6 max-w-xl leading-relaxed">
          The Taker Rebate Program is live on Polymarket starting Thursday, May 29, 2026. Enter any
          wallet address to see its 30-day Weighted Volume, current tier, and how far it is from
          the next.
        </p>
      </header>

      <section className="mb-10 animate-fade-up">
        <WalletInput initialAddress={address} loading={loading} onSubmit={handleSubmit} />
      </section>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-4">
          <div className="h-48 bg-ink-800 border border-ink-600 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-ink-800 border border-ink-600 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-fade-up">
          <TierCard
            current={data.tier.current}
            next={data.tier.next}
            pct={data.tier.pct}
            remaining={data.tier.remaining}
            totalWeightedVolume={data.totalWeightedVolume}
          />
          <StatsGrid
            totalTrades={data.totalTrades}
            totalNotionalUsd={data.totalNotionalUsd}
            current={data.tier.current}
            next={data.tier.next}
          />
          <CategoryBreakdown
            byCategory={data.byCategory}
            totalWeightedVolume={data.totalWeightedVolume}
          />
          <TradesList trades={data.recentTrades} />
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-ink-700 text-xs text-zinc-600 flex flex-wrap justify-between gap-3">
        <p>
          Reads from{" "}
          
            href="https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 underline underline-offset-2"
          >
            data-api.polymarket.com
          </a>{" "}
          and{" "}
          
            href="https://gamma-api.polymarket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 underline underline-offset-2"
          >
            gamma-api.polymarket.com
          </a>
          . No data is stored.
        </p>
        <p>
          
            href="https://docs.polymarket.com/trading/taker-rebates"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 underline underline-offset-2"
          >
            Program docs ↗
          </a>
        </p>
      </footer>
    </main>
  );
}
