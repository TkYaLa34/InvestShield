export type AssetType = "stock" | "etf";
export type ProviderName = "eodhd" | "alpha_vantage" | "sec_edgar" | "fmp";

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: number | null;
  pe_ratio: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previous_close: number | null;
  timestamp: string;
  delayed: boolean;
  provider: ProviderName;
}

export interface HistoricalPrice {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  exchange: string;
  asset_type: AssetType;
  sector: string | null;
  industry: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  currency: string | null;
}

export interface ETFHolding {
  symbol: string;
  name: string;
  weight: number;
  shares: number | null;
  market_value: number | null;
}

export interface SECFiling {
  symbol: string;
  type: string;
  title: string;
  date: string;
  url: string;
}

export interface CacheConfig {
  ttl_seconds: number;
  table_name: string;
}

export interface MarketDataError {
  code: string;
  message: string;
  provider: ProviderName | null;
  retryable: boolean;
}