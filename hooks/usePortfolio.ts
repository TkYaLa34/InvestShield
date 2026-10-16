import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"];
type Position = Database["public"]["Tables"]["positions"]["Row"];

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchPortfolios = useCallback(async () => {
    const { data } = await supabase
      .from("portfolios")
      .select("*")
      .order("created_at", { ascending: false });
    setPortfolios(data ?? []);
  }, [supabase]);

  const fetchPositions = useCallback(
    async (portfolioId: string) => {
      const { data } = await supabase
        .from("positions")
        .select("*")
        .eq("portfolio_id", portfolioId);
    setPositions(data ?? []);
    },
    [supabase]
  );

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return { portfolios, positions, loading, fetchPortfolios, fetchPositions };
}