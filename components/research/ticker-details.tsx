"use client";

import { MoreHorizontal, RefreshCw } from "lucide-react";
import type { Database } from "@/types/database";
import {
  formatCurrency,
  formatPercent,
  formatLargeNumber,
  changeColorClass,
} from "@/lib/utils";

type MarketQuote = Database["public"]["Tables"]["cached_quotes"]["Row"];
type MarketSymbol = Database["public"]["Tables"]["cached_symbols"]["Row"];

interface TickerDetailsProps {
  symbol: string;
  quote?: MarketQuote | null;
  symbolInfo?: MarketSymbol | null;
}

export function TickerDetails({
  symbol,
  quote: quoteProp,
  symbolInfo: symbolInfoProp,
}: TickerDetailsProps) {
  const quote = quoteProp ?? null;
  const symbolInfo = symbolInfoProp ?? null;

  if (!quote) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MoreHorizontal className="w-4 h-4" />
          <span>ไม่พบข้อมูล {symbol}</span>
        </div>
      </div>
    );
  }

  const isUp = quote.change >= 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{symbol}</h2>
            {symbolInfo?.asset_type === "etf" && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                ETF
              </span>
            )}
          </div>
          {symbolInfo?.name && (
            <p className="text-sm text-muted-foreground mt-1">
              {symbolInfo.name}
            </p>
          )}
          {symbolInfo?.exchange && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {symbolInfo.exchange}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("refresh-market-data"))
            }
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="text-3xl font-bold">
          {formatCurrency(quote.price)}
          <span className={`text-lg font-medium ml-2 ${changeColorClass(quote.change)}`}>
            {isUp ? "+" : ""}{formatPercent(quote.change_percent)}
          </span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {formatCurrency(quote.change)} ({formatPercent(quote.change_percent)})
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="ราคาปัจจุบัน"
          value={formatCurrency(quote.price)}
          subtitle="ราคาล่าสุด"
        />
        <MetricCard
          title="มูลค่าตลาด"
          value={formatLargeNumber(quote.market_cap)}
          subtitle="Market Cap"
        />
        <MetricCard
          title="P/E Ratio"
          value={quote.pe_ratio != null ? quote.pe_ratio.toFixed(2) : "—"}
          subtitle="Price to Earnings"
        />
        <MetricCard
          title="ปริมาณซื้อขาย"
          value={formatLargeNumber(quote.volume)}
          subtitle="Volume"
        />
      </div>

      <div className="mt-6 p-3 bg-muted/50 rounded border border-border/50 text-xs text-muted-foreground">
        อัปเดตล่าสุด:{" "}
        {new Date(quote.updated_at).toLocaleString("th-TH")}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
}

function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <div className="text-sm font-medium">{value}</div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}
