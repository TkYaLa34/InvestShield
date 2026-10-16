export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      watchlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      watchlist_items: {
        Row: {
          id: string;
          watchlist_id: string;
          symbol: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          symbol: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          watchlist_id?: string;
          symbol?: string;
          added_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      positions: {
        Row: {
          id: string;
          portfolio_id: string;
          symbol: string;
          shares: number;
          average_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          symbol: string;
          shares: number;
          average_cost: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          symbol?: string;
          shares?: number;
          average_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cached_quotes: {
        Row: {
          symbol: string;
          price: number;
          change: number;
          change_percent: number;
          volume: number;
          market_cap: number | null;
          pe_ratio: number | null;
          updated_at: string;
        };
        Insert: {
          symbol: string;
          price: number;
          change: number;
          change_percent: number;
          volume: number;
          market_cap?: number | null;
          pe_ratio?: number | null;
          updated_at?: string;
        };
        Update: {
          symbol?: string;
          price?: number;
          change?: number;
          change_percent?: number;
          volume?: number;
          market_cap?: number | null;
          pe_ratio?: number | null;
          updated_at?: string;
        };
      };
      cached_symbols: {
        Row: {
          symbol: string;
          name: string;
          exchange: string;
          asset_type: "stock" | "etf";
          sector: string | null;
          industry: string | null;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          symbol: string;
          name: string;
          exchange: string;
          asset_type: "stock" | "etf";
          sector?: string | null;
          industry?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          symbol?: string;
          name?: string;
          exchange?: string;
          asset_type?: "stock" | "etf";
          sector?: string | null;
          industry?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      asset_type: "stock" | "etf";
    };
  };
};