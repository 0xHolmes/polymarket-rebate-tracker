// Thin client around Polymarket's public Data API and Gamma API.
// Neither requires authentication for read endpoints.
//
//   Data API : https://data-api.polymarket.com  (trades, positions, activity)
//   Gamma API: https://gamma-api.polymarket.com (markets, events, tags)

const DATA_API = "https://data-api.polymarket.com";
const GAMMA_API = "https://gamma-api.polymarket.com";

export interface RawTrade {
  proxyWallet: string;
  side: "BUY" | "SELL";
  asset: string;
  conditionId: string;
  size: number;       // shares
  price: number;      // 0..1
  timestamp: number;  // seconds since epoch
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  transactionHash: string;
}

export interface GammaMarketLite {
  conditionId: string;
  slug: string;
  question: string;
  events?: Array<{
    slug: string;
    title: string;
    tags?: Array<{ label: string; slug: string }>;
  }>;
  // Some markets ship tags directly on the market object as well.
  tags?: Array<{ label: string; slug: string }>;
}

/**
 * Fetch all taker trades for a wallet since `sinceTimestamp` (unix seconds).
 * Polymarket paginates with offset/limit; we walk until we cross the window.
 *
 * The `user` parameter accepts either the EOA or the proxy wallet address.
 */
export async function fetchTakerTrades(
  address: string,
  sinceTimestamp: number,
  maxPages = 50,
): Promise<RawTrade[]> {
  const trades: RawTrade[] = [];
  const limit = 500;

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(`${DATA_API}/trades`);
    url.searchParams.set("user", address);
    url.searchParams.set("takerOnly", "true");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(page * limit));

    const res = await fetch(url.toString(), {
      // Vercel caches these for a minute to soften repeat lookups
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Polymarket trades API ${res.status}: ${await res.text()}`);
    }

    const batch = (await res.json()) as RawTrade[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    // Trades come back newest-first. Stop as soon as we cross the window.
    let crossedWindow = false;
    for (const t of batch) {
      if (t.timestamp < sinceTimestamp) {
        crossedWindow = true;
        break;
      }
      trades.push(t);
    }

    if (crossedWindow || batch.length < limit) break;
  }

  return trades;
}

/**
 * Look up markets by condition ID. Gamma supports a comma-separated list,
 * but to stay safely under any URL-length limits we chunk it.
 */
export async function fetchMarketsByConditionIds(
  conditionIds: string[],
): Promise<Map<string, GammaMarketLite>> {
  const out = new Map<string, GammaMarketLite>();
  const unique = Array.from(new Set(conditionIds));
  const chunkSize = 20;

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const url = new URL(`${GAMMA_API}/markets`);
    for (const id of chunk) url.searchParams.append("condition_ids", id);
    url.searchParams.set("limit", String(chunkSize));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      // Don't fail the whole request if a single chunk misbehaves; the
      // affected markets will fall through to the "Other" category bucket.
      continue;
    }

    const json = (await res.json()) as GammaMarketLite[];
    if (!Array.isArray(json)) continue;

    for (const m of json) {
      if (m.conditionId) out.set(m.conditionId, m);
    }
  }

  return out;
}

/** Pull the unique set of tag labels off a Gamma market record. */
export function tagsForMarket(m: GammaMarketLite | undefined): string[] {
  if (!m) return [];
  const labels = new Set<string>();
  for (const t of m.tags ?? []) labels.add(t.label);
  for (const e of m.events ?? []) {
    for (const t of e.tags ?? []) labels.add(t.label);
  }
  return Array.from(labels);
}
