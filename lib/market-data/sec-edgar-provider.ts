// lib/market-data/sec-edgar-provider.ts
// SEC EDGAR API Provider — ดึงข้อมูลเอกสาร 10-K, 10-Q, 8-K จาก SEC EDGAR
// เชื่อมต่อกับระบบ Caching ใน Supabase (cached_sec_filings)

import type { ProviderName, SECFiling, Quote, HistoricalPrice, CompanyProfile, ETFHolding } from "./types";
import { BaseMarketDataProvider } from "./base-provider";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CachedSECFiling = Database["public"]["Tables"]["cached_sec_filings"]["Row"];
type CachedSECFilingInsert = Database["public"]["Tables"]["cached_sec_filings"]["Insert"];

const CACHE_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours

const SEC_FILING_TYPES = ["10-K", "10-Q", "8-K"];

export class SecEdgarProvider extends BaseMarketDataProvider {
  protected readonly provider: ProviderName = "sec_edgar";
  protected readonly baseURL = "https://data.sec.gov";

  private userAgent: string;

  constructor(userAgent?: string) {
    super();
    this.userAgent =
      userAgent || process.env.SEC_EDGAR_USER_AGENT || "InvestShield AdminContact@investshield.com";
  }

  private async request<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        "Accept-Encoding": "gzip, deflate",
        Host: "data.sec.gov",
      },
    });
    if (!response.ok) {
      throw new Error(`SEC EDGAR API error: ${response.status}`);
    }
    return response.json();
  }

  private async lookupCIK(symbol: string): Promise<string | null> {
    try {
      const data = await this.request<Record<string, { cik_str: number; ticker: string; title: string }>>(
        "https://www.sec.gov/files/company_tickers.json"
      );

      const upperSymbol = symbol.toUpperCase();
      for (const entry of Object.values(data)) {
        if (entry.ticker.toUpperCase() === upperSymbol) {
          return String(entry.cik_str).padStart(10, "0");
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async getSECFilings(symbol: string): Promise<SECFiling[]> {
    const supabase = createClient();
    const upperSymbol = symbol.toUpperCase();

    const { data: cached } = await supabase
      .from("cached_sec_filings")
      .select("*")
      .eq("symbol", upperSymbol)
      .in("type", SEC_FILING_TYPES);

    if (cached && cached.length > 0) {
      const rows = cached as CachedSECFiling[];
      const isStale =
        Date.now() - new Date(rows[0]!.updated_at).getTime() > CACHE_STALE_MS;
      if (!isStale) {
        return rows.map((row) => ({
          symbol: row.symbol,
          type: row.type,
          title: row.title,
          date: row.date,
          url: row.url,
        }));
      }
    }

    const cik = await this.lookupCIK(upperSymbol);
    if (!cik) {
      return [];
    }

    const submissions = await this.request<{
      recent: {
        form: string[];
        filingDate: string[];
        primaryDocument: string[];
        accessionNumber: string[];
        primaryDocDescription: string[];
      };
    }>(`${this.baseURL}/submissions/CIK${cik}.json`);

    const filings: SECFiling[] = [];
    const forms = submissions.recent.form;
    const dates = submissions.recent.filingDate;
    const docs = submissions.recent.primaryDocument;
    const accessions = submissions.recent.accessionNumber;
    const descriptions = submissions.recent.primaryDocDescription;

    const typeCount: Record<string, number> = {};

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]!;
      if (!SEC_FILING_TYPES.includes(form)) continue;

      typeCount[form] = (typeCount[form] ?? 0) + 1;
      if (typeCount[form] > 3) continue;

      const accessionNo = accessions[i]!.replace(/-/g, "");
      const url = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accessionNo}/${docs[i]!}`;

      filings.push({
        symbol: upperSymbol,
        type: form,
        title: (descriptions[i] ?? form) as string,
        date: dates[i]!,
        url,
      });
    }

    if (filings.length > 0) {
      const upsertData: CachedSECFilingInsert[] = filings.map((f) => ({
        symbol: f.symbol,
        type: f.type,
        title: f.title,
        date: f.date,
        url: f.url,
        updated_at: new Date().toISOString(),
      }));

      await supabase
        .from("cached_sec_filings")
        .upsert(upsertData as any, {
          onConflict: "symbol",
        });
    }

    return filings;
  }

  async getQuote(_symbol: string): Promise<Quote> {
    throw new Error("SecEdgarProvider does not support getQuote");
  }

  async getHistory(_symbol: string, _range: string): Promise<HistoricalPrice[]> {
    throw new Error("SecEdgarProvider does not support getHistory");
  }

  async getCompany(_symbol: string): Promise<CompanyProfile> {
    throw new Error("SecEdgarProvider does not support getCompany");
  }

  async getETF(_symbol: string): Promise<CompanyProfile> {
    throw new Error("SecEdgarProvider does not support getETF");
  }

  async getETHoldings(_symbol: string): Promise<ETFHolding[]> {
    throw new Error("SecEdgarProvider does not support getETHoldings");
  }
}