// Category weights, copied verbatim from
// https://docs.polymarket.com/trading/taker-rebates
//
// Polymarket tags markets by topic (e.g. "Politics", "Sports", "Crypto",
// "Geopolitics"). We map a market's primary tags to a category bucket and
// look up the weight here.

export type Category =
  | "Sports"
  | "Politics"
  | "Finance"
  | "Mentions"
  | "Tech"
  | "Economics"
  | "Culture"
  | "Weather"
  | "Other"
  | "Crypto"
  | "Geopolitics";

export const CATEGORY_WEIGHT: Record<Category, number> = {
  Sports: 1.0,
  Politics: 1.3,
  Finance: 1.3,
  Mentions: 1.3,
  Tech: 1.3,
  Economics: 1.7,
  Culture: 1.7,
  Weather: 1.7,
  Other: 1.7,
  Crypto: 2.3,
  Geopolitics: 0, // free to trade, earns no wV
};

// Map a list of tag labels (as returned by the Gamma API) to a category.
// We prefer the highest-weight match because traders care about the wV
// they earn, and Polymarket tags are typically additive (a market can be
// both "Crypto" and "Economics", but the Crypto weight dominates).
export function categoryFromTags(tagLabels: string[]): Category {
  if (!tagLabels || tagLabels.length === 0) return "Other";

  const normalized = tagLabels.map((t) => t.toLowerCase().trim());
  const has = (kw: string) => normalized.some((t) => t.includes(kw));

  // Order matters: check the zero-weight bucket first so it short-circuits,
  // then the highest-weight categories down to the lowest.
  if (has("geopolitic") || has("world event") || has("war")) return "Geopolitics";
  if (has("crypto") || has("bitcoin") || has("ethereum") || has("solana")) return "Crypto";
  if (has("economic") || has("inflation") || has("recession") || has("gdp")) return "Economics";
  if (has("weather") || has("climate") || has("hurricane")) return "Weather";
  if (has("culture") || has("entertainment") || has("award") || has("music") || has("celebrity")) return "Culture";
  if (has("politic") || has("election") || has("congress") || has("president")) return "Politics";
  if (has("finance") || has("stock") || has("market") || has("fed")) return "Finance";
  if (has("mention")) return "Mentions";
  if (has("tech") || has("ai") || has("openai") || has("software")) return "Tech";
  if (has("sport") || has("nba") || has("nfl") || has("soccer") || has("mlb") || has("tennis"))
    return "Sports";

  return "Other";
}

export function weightForTags(tagLabels: string[]): number {
  return CATEGORY_WEIGHT[categoryFromTags(tagLabels)];
}
