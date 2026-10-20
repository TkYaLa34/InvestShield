import { useState, useEffect, useCallback } from "react";

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number | null;
  peRatio?: number | null;
  updatedAt: string;
}

export function useMarketData(symbol: string) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();

      // Try cache first
      const { data: cached } = await supabase
        .from("cached_quotes")
        .select("*")
        .eq("symbol", symbol.toUpperCase())
        .single();

      if (cached) {
        const row = cached as { symbol: string; price: number; change: number; change_percent: number; volume: number; market_cap: number | null; pe_ratio: number | null; updated_at: string };
        setQuote({
          symbol: row.symbol,
          price: row.price,
          change: row.change,
          changePercent: row.change_percent,
          volume: row.volume,
          marketCap: row.market_cap,
          peRatio: row.pe_ratio,
          updatedAt: row.updated_at,
        });
        setLoading(false);
        return;
      }

      // Fetch from external API (Finnhub)
      const response = await fetch(
        `/api/market-data/quote?symbol=${encodeURIComponent(symbol)}`
      );
      if (!response.ok) throw new Error("Failed to fetch quote");

      const data = await response.json();
      setQuote({
        symbol: data.symbol || symbol,
        price: data.price || data.c,
        change: data.change || data.d,
        changePercent: data.changePercent || data.dp,
        volume: data.volume || 0,
        marketCap: data.marketCap || null,
        peRatio: data.peRatio || null,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return { quote, loading, error, refetch: fetchQuote };
}