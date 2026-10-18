import { createMarketDataCache } from "@/lib/cache";
import { TickerDetails } from "@/components/research/ticker-details";
import { PriceChart } from "@/components/research/chart";
import { FinancialsCard } from "@/components/research/financials";
import { FinancialDisclaimer, PageHeader } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResearchPage({
  params,
}: {
  params: { ticker: string };
}) {
  const symbol = String(params.ticker).toUpperCase();
  const cache = createMarketDataCache();

  let quote;
  let symbolInfo;
  let priceHistory;

  try {
    [quote, symbolInfo, priceHistory] = await Promise.all([
      cache.getQuote(symbol),
      cache.getSymbol(symbol),
      cache.getPriceHistory(symbol, { resolution: "D", count: 30 }),
    ]);
  } catch {
    // Fall back gracefully if cache/DB is not yet configured
    quote = null;
    symbolInfo = null;
    priceHistory = { symbol, candles: [] };
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Research — ${symbol}`}
        description={
          symbolInfo?.name
            ? `ข้อมูลหุ้น/ETF ${symbol} (${symbolInfo.name})`
            : undefined
        }
      />

      {/* Breadcrumb / back link */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/watchlist"
          className="hover:text-primary transition-colors"
        >
          ← กลับไป Watchlist
        </Link>
        <span className="mx-2 text-xs">/</span>
        <span className="font-medium">{symbol}</span>
      </div>

      {/* Ticker Details */}
      <TickerDetails
        symbol={symbol}
        quote={quote ?? undefined}
        symbolInfo={symbolInfo ?? undefined}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart (main) */}
        <div className="lg:col-span-2">
          <PriceChart symbol={symbol} />
        </div>

        {/* Financials (sidebar) */}
        <div className="lg:col-span-1">
          {quote ? (
            <FinancialsCard
              symbol={symbol}
              market_cap={quote.market_cap}
              pe_ratio={quote.pe_ratio}
              volume={quote.volume}
            />
          ) : (
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                ไม่มีข้อมูลทางการเงินสำหรับ {symbol}
              </p>
            </div>
          )}
        </div>
      </div>

      <FinancialDisclaimer />
    </div>
  );
}
