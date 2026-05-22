"use client";

import { useState } from "react";

interface Props {
  initialAddress?: string;
  loading: boolean;
  onSubmit: (address: string) => void;
}

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function WalletInput({ initialAddress = "", loading, onSubmit }: Props) {
  const [value, setValue] = useState(initialAddress);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!ADDRESS_RE.test(trimmed)) {
      setError("That doesn't look like a wallet address (need 0x + 40 hex chars).");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="w-full">
      <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
        Wallet address
      </label>
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="text"
          inputMode="text"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="0x56687bf447db6ffa42ffe2204a05edaa20f55839"
          className="flex-1 bg-ink-800 border border-ink-600 rounded-lg px-4 py-3 font-mono text-sm
                     placeholder:text-zinc-600 focus:outline-none focus:border-accent
                     focus:ring-1 focus:ring-accent transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-accent hover:bg-blue-500 disabled:bg-ink-600 disabled:cursor-not-allowed
                     text-white font-medium px-6 py-3 rounded-lg transition-colors
                     min-w-[120px]"
        >
          {loading ? "Loading…" : "Track →"}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
