// lib/market-data/fmp-provider.ts
// Financial Modeling Prep (FMP) API Provider — ดึงตัวเลขทางการเงินเชิงลึก
// Financial Ratios และ Key Metrics เชื่อมต่อกับระบบ Caching ใน Supabase (cached_financial_metrics)

import type { ProviderName } from "./types";
import { BaseMarketDataProvider } from "./base-provider";
import type { FinancialIndicators } from "@/types/market";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CachedFinancialMetrics = Database["public"]["Tables"]["cached_financial_metrics"]["Row"];
type CachedFinancialMetricsInsert = Database["public"]["Tables"]["cached_financial_metrics"]["Insert"];

const CACHE_STALE_MS = 6 * 60 * 60 * 1000; // 6 hours

export class FmpProvider extends BaseMarketDataProvider {
  protected readonly provider: ProviderName = "fmp";
  protected readonly baseURL = "https://financialmodelingprep.com/api/v3";

  private apiKey: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.FMP_API_KEY!;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}?apikey=${this.apiKey}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }
    return response.json();
  }

  async getFinancialMetrics(symbol: string): Promise<FinancialIndicators | null> {
    const supabase = createClient();
    const upperSymbol = symbol.toUpperCase();

    const { data: cached } = await supabase
      .from("cached_financial_metrics")
      .select("*")
      .eq("symbol", upperSymbol)
      .single();

    if (cached) {
      const row = cached as CachedFinancialMetrics;
      const isStale =
        Date.now() - new Date(row.updated_at).getTime() > CACHE_STALE_MS;
      if (!isStale) {
        return this.mapCachedRowToFinancialIndicators(row);
      }
    }

    try {
      const [ratiosData, metricsData] = await Promise.all([
        this.request<any[]>(`/ratios/${upperSymbol}`),
        this.request<any[]>(`/key-metrics/${upperSymbol}`),
      ]);

      const latestRatio = ratiosData?.[0] ?? {};
      const latestMetric = metricsData?.[0] ?? {};

      const financialIndicators: FinancialIndicators = {
        symbol: upperSymbol,
        pe_ratio: latestRatio.priceEarningsRatio ?? latestMetric.priceEarningsRatio ?? null,
        pb_ratio: latestRatio.priceToBookRatio ?? latestMetric.priceToBookRatio ?? null,
        ps_ratio: latestRatio.priceToSalesRatio ?? latestMetric.priceToSalesRatio ?? null,
        peg_ratio: latestRatio.pegRatio ?? latestMetric.pegRatio ?? null,
        ev_to_ebitda: latestRatio.enterpriseValueMultiple ?? latestMetric.enterpriseValueMultiple ?? null,
        profit_margin: latestRatio.profitMargin ?? latestMetric.profitMargin ?? null,
        operating_margin: latestRatio.operatingProfitMargin ?? latestMetric.operatingProfitMargin ?? null,
        roe: latestRatio.returnOnEquity ?? latestMetric.returnOnEquity ?? null,
        roa: latestRatio.returnOnAssets ?? latestMetric.returnOnAssets ?? null,
        roic: latestRatio.returnOnInvestedCapital ?? latestMetric.returnOnInvestedCapital ?? null,
        revenue_growth: latestRatio.revenueGrowth ?? latestMetric.revenueGrowth ?? null,
        earnings_growth: latestRatio.earningsGrowth ?? latestMetric.earningsGrowth ?? null,
        eps_growth: latestRatio.epsgrowth ?? latestMetric.epsgrowth ?? null,
        current_ratio: latestRatio.currentRatio ?? latestMetric.currentRatio ?? null,
        quick_ratio: latestRatio.quickRatio ?? latestMetric.quickRatio ?? null,
        debt_to_equity: latestRatio.debtToEquity ?? latestMetric.debtToEquity ?? null,
        dividend_yield: latestRatio.dividendYield ?? latestMetric.dividendYield ?? null,
        payout_ratio: latestRatio.payoutRatio ?? latestMetric.payoutRatio ?? null,
        beta: latestMetric.beta ?? null,
        shares_outstanding: latestMetric.sharesOutstanding ?? null,
        float_shares: latestMetric.floatShares ?? null,
        updated_at: new Date().toISOString(),
        provider: "fmp",
      };

      const upsertData: CachedFinancialMetricsInsert = {
        symbol: upperSymbol,
        pe_ratio: financialIndicators.pe_ratio,
        pb_ratio: financialIndicators.pb_ratio,
        ps_ratio: financialIndicators.ps_ratio,
        peg_ratio: financialIndicators.peg_ratio,
        ev_to_ebitda: financialIndicators.ev_to_ebitda,
        profit_margin: financialIndicators.profit_margin,
        operating_margin: financialIndicators.operating_margin,
        roe: financialIndicators.roe,
        roa: financialIndicators.roa,
        roic: financialIndicators.roic,
        revenue_growth: financialIndicators.revenue_growth,
        earnings_growth: financialIndicators.earnings_growth,
        eps_growth: financialIndicators.eps_growth,
        current_ratio: financialIndicators.current_ratio,
        quick_ratio: financialIndicators.quick_ratio,
        debt_to_equity: financialIndicators.debt_to_equity,
        dividend_yield: financialIndicators.dividend_yield,
        payout_ratio: financialIndicators.payout_ratio,
        beta: financialIndicators.beta,
        shares_outstanding: financialIndicators.shares_outstanding,
        float_shares: financialIndicators.float_shares,
        updated_at: financialIndicators.updated_at,
      };

      await supabase
        .from("cached_financial_metrics")
        .upsert(upsertData as any, {
          onConflict: "symbol",
        });

      return financialIndicators;
    } catch {
      return null;
    }
  }

  private mapCachedRowToFinancialIndicators(row: CachedFinancialMetrics): FinancialIndicators {
    return {
      symbol: row.symbol,
      pe_ratio: row.pe_ratio,
      pb_ratio: row.pb_ratio,
      ps_ratio: row.ps_ratio,
      peg_ratio: row.peg_ratio,
      ev_to_ebitda: row.ev_to_ebitda,
      profit_margin: row.profit_margin,
      operating_margin: row.operating_margin,
      roe: row.roe,
      roa: row.roa,
      roic: row.roic,
      revenue_growth: row.revenue_growth,
      earnings_growth: row.earnings_growth,
      eps_growth: row.eps_growth,
      current_ratio: row.current_ratio,
      quick_ratio: row.quick_ratio,
      debt_to_equity: row.debt_to_equity,
      dividend_yield: row.dividend_yield,
      payout_ratio: row.payout_ratio,
      beta: row.beta,
      shares_outstanding: row.shares_outstanding,
      float_shares: row.float_shares,
      updated_at: row.updated_at,
      provider: "fmp",
    };
  }

  async getQuote(_symbol: string): Promise<{ symbol: string; price: number; change: number; change_percent: number; volume: number; market_cap: number | null; pe_ratio: number | null; open: number | null; high: number | null; low: number | null; previous_close: number | null; timestamp: string; delayed: boolean; provider: ProviderName }> {
    throw new Error("FmpProvider does not support getQuote");
  }

  async getHistory(_symbol: string, _range: string): Promise<{ symbol: string; date: string; open: number; high: number; low: number; close: number; volume: number }[]> {
    throw new Error("FmpProvider does not support getHistory");
  }

  async getCompany(_symbol: string): Promise<{ symbol: string; name: string; exchange: string; asset_type: "stock" | "etf"; sector: string | null; industry: string | null; description: string | null; website: string | null; country: string | null; currency: string | null }> {
    throw new Error("FmpProvider does not support getCompany");
  }

  async getETF(_symbol: string): Promise<{ symbol: string; name: string; exchange: string; asset_type: "stock" | "etf"; sector: string | null; industry: string | null; description: string | null; website: string | null; country: string | null; currency: string | null }> {
    throw new Error("FmpProvider does not support getETF");
  }

  async getETHoldings(_symbol: string): Promise<{ symbol: string; name: string; weight: number; shares: number | null; market_value: number | null }[]> {
    throw new Error("FmpProvider does not support getETHoldings");
  }

  async getSECFilings(_symbol: string): Promise<{ symbol: string; type: string; title: string; date: string; url: string }[]> {
    throw new Error("FmpProvider does not support getSECFilings");
  }
}