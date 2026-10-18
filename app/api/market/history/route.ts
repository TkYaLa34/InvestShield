import { NextResponse } from "next/server";
import { createMarketDataCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const cache = createMarketDataCache();
    const history = await cache.getPriceHistory(symbol.toUpperCase(), {
      resolution: "D",
      count: 30,
    });

    return NextResponse.json({ symbol: history.symbol, candles: history.candles });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
