// types/market.ts
// Type definitions for Market Data Layer - Quote, Historical Data, Financial Indicators

export type AssetType = "stock" | "etf";

export type MarketDataProvider = "finnhub" | "eodhd" | "alpha_vantage" | "sec_edgar";

/**
 * Real-time quote data for a symbol
 */
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
  provider: MarketDataProvider;
}

/**
 * Historical price data point (OHLCV)
 */
export interface HistoricalPrice {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Historical data range options
 */
export type HistoricalRange = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" | "MAX";

/**
 * Historical data response with metadata
 */
export interface HistoricalDataResponse {
  symbol: string;
  range: HistoricalRange;
  prices: HistoricalPrice[];
  count: number;
}

/**
 * Financial indicators / fundamental data
 */
export interface FinancialIndicators {
  symbol: string;
  // Valuation
  pe_ratio: number | null;
  pb_ratio: number | null;
  ps_ratio: number | null;
  peg_ratio: number | null;
  ev_to_ebitda: number | null;
  // Profitability
  profit_margin: number | null;
  operating_margin: number | null;
  roe: number | null;
  roa: number | null;
  roic: number | null;
  // Growth
  revenue_growth: number | null;
  earnings_growth: number | null;
  eps_growth: number | null;
  // Financial Health
  current_ratio: number | null;
  quick_ratio: number | null;
  debt_to_equity: number | null;
  // Dividend
  dividend_yield: number | null;
  payout_ratio: number | null;
  // Market
  beta: number | null;
  shares_outstanding: number | null;
  float_shares: number | null;
  // Timestamp
  updated_at: string;
  provider: MarketDataProvider;
}

/**
 * Company profile / basic information
 */
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
  ipo_date: string | null;
  market_cap: number | null;
  employees: number | null;
}

/**
 * ETF holding information
 */
export interface ETFHolding {
  symbol: string;
  name: string;
  weight: number;
  shares: number | null;
  market_value: number | null;
}

/**
 * SEC filing record
 */
export interface SECFiling {
  symbol: string;
  type: string;
  title: string;
  date: string;
  url: string;
}

/**
 * Cache configuration for market data
 */
export interface CacheConfig {
  ttl_seconds: number;
  table_name: string;
}

/**
 * Market data error response
 */
export interface MarketDataError {
  code: string;
  message: string;
  provider: MarketDataProvider | null;
  retryable: boolean;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: MarketDataError | null;
  success: boolean;
}