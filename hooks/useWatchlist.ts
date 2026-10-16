import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Watchlist = Database["public"]["Tables"]["watchlists"]["Row"];
type WatchlistItem = Database["public"]["Tables"]["watchlist_items"]["Row"];

export function useWatchlist() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchWatchlists = useCallback(async () => {
    const { data } = await supabase
      .from("watchlists")
      .select("*")
      .order("created_at", { ascending: false });
    setWatchlists(data ?? []);
  }, [supabase]);

  const fetchItems = useCallback(
    async (watchlistId: string) => {
      const { data } = await supabase
        .from("watchlist_items")
        .select("*")
        .eq("watchlist_id", watchlistId)
        .order("added_at", { ascending: false });
      setItems(data ?? []);
    },
    [supabase]
  );

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  return { watchlists, items, loading, fetchWatchlists, fetchItems };
}