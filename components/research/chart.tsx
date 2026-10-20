"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, changeColorClass } from "@/lib/utils";

type PriceCandle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

interface ChartProps {
  symbol: string;
}

export function PriceChart({ symbol }: ChartProps) {
  const [candles, setCandles] = useState<PriceCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/market/history?symbol=${symbol}`, {
          headers: { Accept: "application/json" },
          next: { revalidate: 60 },
        });
        if (!res.ok) throw new Error("ไม่สามารถโหลดกราฟราคาได้");
        const data = await res.json();
        if (!cancelled) setCandles(data.candles ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">
          กำลังโหลดกราฟ {symbol}...
        </p>
      </div>
    );
  }

  if (error || candles.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <RefreshCw className="w-4 h-4" />
          {error || "ไม่มีข้อมูลราคา " + symbol}
        </div>
      </div>
    );
  }

  return <SparklineChart symbol={symbol} candles={candles} />;
}

function SparklineChart({
  symbol,
  candles,
}: {
  symbol: string;
  candles: PriceCandle[];
}) {
  if (candles.length === 0) return null;

  const width = 400;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const prices = candles.map((c) => c.c);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const isUp = candles[candles.length - 1]!.c >= candles[0]!.c;
  const lastClose = candles[candles.length - 1]!.c;

  const xScale = (i: number) =>
    padding.left + (i / Math.max(candles.length - 1, 1)) * chartWidth;
  const yScale = (price: number) =>
    padding.top +
    chartHeight -
    ((price - minPrice) / Math.max(maxPrice - minPrice, 1)) * chartHeight;

  let linePath = "";
  candles.forEach((c, i) => {
    const x = xScale(i);
    const y = yScale(c.c);
    linePath += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  const areaPath = `M ${xScale(0)} ${yScale(candles[0]!.c)} ${linePath.slice(1)} L ${xScale(
    candles.length - 1
  )} ${yScale(minPrice)} L ${xScale(0)} ${yScale(minPrice)} Z`;

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString();

  return (
    <div className="w-full h-64">
      <svg width={width} height={height} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isUp ? "#22c55e" : "#ef4444"}
              stopOpacity="0.35"
            />
            <stop
              offset="100%"
              stopColor={isUp ? "#22c55e" : "#ef4444"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chart-gradient)" />
        <path
          d={linePath}
          fill="none"
          stroke={isUp ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g fill="none">
          <text
            x={padding.left - 8}
            y={padding.top + 5}
            textAnchor="end"
            fontSize="10"
            fill="var(--muted-foreground)"
          >
            {formatCurrency(maxPrice).replace("$", "")}
          </text>
          <text
            x={padding.left - 8}
            y={yScale(minPrice) + 5}
            textAnchor="end"
            fontSize="10"
            fill="var(--muted-foreground)"
          >
            {formatCurrency(minPrice).replace("$", "")}
          </text>
        </g>
        <g fill="none">
          <text
            x={padding.left}
            y={height - padding.bottom + 22}
            fontSize="10"
            fill="var(--muted-foreground)"
          >
            {formatDate(candles[0]!.t)}
          </text>
          <text
            x={width - padding.right}
            y={height - padding.bottom + 22}
            fontSize="10"
            textAnchor="end"
            fill="var(--muted-foreground)"
          >
            {formatDate(candles[candles.length - 1]!.t)}
          </text>
        </g>
      </svg>
      <div className="mt-4 grid grid-cols-4 gap-3 text-xs text-muted-foreground">
        <div>
          <div className="text-[10px] mb-0.5">ราคาเปิด</div>
          <div className="font-medium">{formatCurrency(candles[0]!.o)}</div>
        </div>
        <div>
          <div className="text-[10px] mb-0.5">สูงสุด</div>
          <div className="font-medium">{formatCurrency(maxPrice)}</div>
        </div>
        <div>
          <div className="text-[10px] mb-0.5">ต่ำสุด</div>
          <div className="font-medium">{formatCurrency(minPrice)}</div>
        </div>
        <div>
          <div className="text-[10px] mb-0.5">ปิดล่าสุด</div>
          <div className="font-medium">{formatCurrency(lastClose)}</div>
        </div>
      </div>
    </div>
  );
}
