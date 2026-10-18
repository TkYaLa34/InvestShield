import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CachedQuote = Database["public"]["Tables"]["cached_quotes"]["Row"];
type CachedSymbol = Database["public"]["Tables"]["cached_symbols"]["Row"];

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: number | null;
  pe_ratio: number | null;
  updated_at: string;
}

export interface MarketSymbol {
  symbol: string;
  name: string;
  exchange: string;
  asset_type: "stock" | "etf";
  sector: string | null;
  industry: string | null;
}

export interface PriceCandle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface PriceHistory {
  symbol: string;
  candles: PriceCandle[];
}

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<MarketQuote>;
  getSymbol(symbol: string): Promise<MarketSymbol | null>;
  getPriceHistory(
    symbol: string,
    options?: { resolution?: "D" | "W" | "M"; count?: number }
  ): Promise<PriceHistory>;
}

/*-------------------------------------------------------------------------
  Finnhub Provider (free tier)
  https://finnhub.io/docs/api
-------------------------------------------------------------------------*/
export class FinnhubProvider implements MarketDataProvider {
  private apiKey: string;
  private baseUrl = "https://finnhub.io/api/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FINNHUB_API_KEY!;
  }

  private async request(endpoint: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}${endpoint}?token=${this.apiKey}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.status}`);
    }
    return res.json();
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const data = await this.request(`/quote?symbol=${symbol}`);
    return {
      symbol,
      price: data.c ?? 0,
      change: data.d ?? 0,
      change_percent: data.dp ?? 0,
      volume: 0,
      market_cap: null,
      pe_ratio: null,
      updated_at: new Date().toISOString(),
    };
  }

  async getSymbol(symbol: string): Promise<MarketSymbol | null> {
    try {
      const data = await this.request(`/stock/profile2?symbol=${symbol}`);
      if (!data || !data.name) return null;
      return {
        symbol,
        name: data.name,
        exchange: data.exchange ?? "",
        asset_type: data.exchange?.toLowerCase().includes("etf")
          ? "etf"
          : "stock",
        sector: data.finnhubIndustry ?? null,
        industry: null,
      };
    } catch {
      return null;
    }
  }

  async getPriceHistory(
    symbol: string,
    options?: { resolution?: "D" | "W" | "M"; count?: number }
  ): Promise<PriceHistory> {
    const count = options?.count ?? 30;
    const end = Math.floor(Date.now() / 1000);
    const start = end - count * 86400;

    const data = await this.request(
      `/stock/candle?symbol=${symbol}&resolution=${
        options?.resolution ?? "D"
      }&from=${start}&to=${end}`
    );

    if (data.s === "no_data" || !data.t) {
      return { symbol, candles: [] };
    }

    const candles: PriceCandle[] = (data.t as number[]).map(
      (t: number, i: number) => ({
        t,
        o: (data.o as number[])[i] ?? 0,
        h: (data.h as number[])[i] ?? 0,
        l: (data.l as number[])[i] ?? 0,
        c: (data.c as number[])[i] ?? 0,
        v: (data.v as number[])[i] ?? 0,
      })
    );

    return { symbol, candles };
  }
}

/*-------------------------------------------------------------------------
  Supabase-backed Cache Layer
-------------------------------------------------------------------------*/
const CACHE_STALE_MS = 5 * 60 * 1000; // 5 minutes

export class MarketDataCache {
  private provider: MarketDataProvider;

  constructor(provider: MarketDataProvider) {
    this.provider = provider;
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const supabase = createClient();

    const { data: cached } = await supabase
      .from("cached_quotes")
      .select("*")
      .eq("symbol", symbol)
      .single();

    const isStale =
      !cached ||
      Date.now() - new Date(cached.updated_at).getTime() > CACHE_STALE_MS;

    if (!isStale && cached) {
      return this.mapCachedQuote(cached);
    }

    const fresh = await this.provider.getQuote(symbol);

    await supabase.from("cached_quotes").upsert({
      symbol: fresh.symbol,
      price: fresh.price,
      change: fresh.change,
      change_percent: fresh.change_percent,
      volume: fresh.volume,
      market_cap: fresh.market_cap,
      pe_ratio: fresh.pe_ratio,
      updated_at: fresh.updated_at,
    });

    return fresh;
  }

  async getSymbol(symbol: string): Promise<MarketSymbol | null> {
    const supabase = createClient();

    const { data: cached } = await supabase
      .from("cached_symbols")
      .select("*")
      .eq("symbol", symbol)
      .single();

    if (cached) {
      return {
        symbol: cached.symbol,
        name: cached.name,
        exchange: cached.exchange,
        asset_type: cached.asset_type,
        sector: cached.sector,
        industry: cached.industry,
      };
    }

    const fromProvider = await this.provider.getSymbol(symbol);
    if (!fromProvider) return null;

    await supabase.from("cached_symbols").upsert({
      symbol: fromProvider.symbol,
      name: fromProvider.name,
      exchange: fromProvider.exchange,
      asset_type: fromProvider.asset_type,
      sector: fromProvider.sector,
      industry: fromProvider.industry,
    });

    return fromProvider;
  }

  async getPriceHistory(
    symbol: string,
    options?: { resolution?: "D" | "W" | "M"; count?: number }
  ): Promise<PriceHistory> {
    return this.provider.getPriceHistory(symbol, options);
  }

  private mapCachedQuote(row: CachedQuote): MarketQuote {
    return {
      symbol: row.symbol,
      price: row.price,
      change: row.change,
      change_percent: row.change_percent,
      volume: row.volume,
      market_cap: row.market_cap,
      pe_ratio: row.pe_ratio,
      updated_at: row.updated_at,
    };
  }
}

export function createMarketDataCache(): MarketDataCache {
  return new MarketDataCache(new FinnhubProvider());
}
