import { NextResponse } from "next/server";
import { createAIProvider } from "@/lib/ai/providers";
import { ResearchAssistant, RESEARCH_SYSTEM_PROMPT } from "@/lib/ai/research-assistant";
import type { ResearchContext } from "@/lib/ai/research-assistant";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CachedQuote = Database["public"]["Tables"]["cached_quotes"]["Row"];
type CachedSymbol = Database["public"]["Tables"]["cached_symbols"]["Row"];

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, user_question } = body;

    if (!symbol) {
      return NextResponse.json({ error: "symbol is required" }, { status: 400 });
    }

    const supabase = createClient();

    // Fetch quote and symbol info from cache
    const [qRes, sRes] = await Promise.all([
      supabase.from("cached_quotes").select("*").eq("symbol", symbol).single(),
      supabase.from("cached_symbols").select("*").eq("symbol", symbol).single(),
    ]);

    const quote = qRes.data as CachedQuote | null;
    const symbolInfo = sRes.data as CachedSymbol | null;

    const ctx: ResearchContext = {
      symbol: symbol.toUpperCase(),
      name: symbolInfo?.name ?? undefined,
      asset_type: symbolInfo?.asset_type ?? undefined,
      sector: symbolInfo?.sector ?? undefined,
      price: quote?.price ?? undefined,
      change_percent: quote?.change_percent ?? undefined,
      market_cap: quote?.market_cap ?? undefined,
      pe_ratio: quote?.pe_ratio ?? undefined,
      volume: quote?.volume ?? undefined,
      user_question: user_question ?? undefined,
    };

    const provider = createAIProvider();
    const assistant = new ResearchAssistant(provider);
    const result = await assistant.research(ctx);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
