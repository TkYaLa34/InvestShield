-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable Row Level Security
alter table if exists public.profiles enable row level security;
alter table if exists public.watchlists enable row level security;
alter table if exists public.watchlist_items enable row level security;
alter table if exists public.portfolios enable row level security;
alter table if exists public.positions enable row level security;
alter table if exists public.notes enable row level security;
alter table if exists public.cached_quotes enable row level security;
alter table if exists public.cached_symbols enable row level security;

-- profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- watchlists table
create table if not exists public.watchlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null default 'Watchlist',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- watchlist_items table
create table if not exists public.watchlist_items (
  id uuid default uuid_generate_v4() primary key,
  watchlist_id uuid references public.watchlists(id) on delete cascade not null,
  symbol text not null,
  added_at timestamptz default now(),
  unique(watchlist_id, symbol)
);

-- portfolios table
create table if not exists public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null default 'Portfolio',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- positions table
create table if not exists public.positions (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  symbol text not null,
  shares numeric not null default 0,
  average_cost numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(portfolio_id, symbol)
);

-- notes table
create table if not exists public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  symbol text not null,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- cached_quotes table
create table if not exists public.cached_quotes (
  symbol text primary key,
  price numeric not null,
  change numeric not null default 0,
  change_percent numeric not null default 0,
  volume bigint not null default 0,
  market_cap numeric,
  pe_ratio numeric,
  updated_at timestamptz default now()
);

-- cached_symbols table
create table if not exists public.cached_symbols (
  symbol text primary key,
  name text not null,
  exchange text not null,
  asset_type text check (asset_type in ('stock', 'etf')) not null,
  sector text,
  industry text,
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- RLS Policies: Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies: Watchlists
create policy "Users can view their own watchlists"
  on public.watchlists for select
  using (auth.uid() = user_id);

create policy "Users can insert their own watchlists"
  on public.watchlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own watchlists"
  on public.watchlists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own watchlists"
  on public.watchlists for delete
  using (auth.uid() = user_id);

-- RLS Policies: Watchlist Items
create policy "Users can view watchlist items from their watchlists"
  on public.watchlist_items for select
  using (
    exists (
      select 1 from public.watchlists
      where id = watchlist_id and user_id = auth.uid()
    )
  );

create policy "Users can insert watchlist items into their watchlists"
  on public.watchlist_items for insert
  with check (
    exists (
      select 1 from public.watchlists
      where id = watchlist_id and user_id = auth.uid()
    )
  );

create policy "Users can delete watchlist items from their watchlists"
  on public.watchlist_items for delete
  using (
    exists (
      select 1 from public.watchlists
      where id = watchlist_id and user_id = auth.uid()
    )
  );

-- RLS Policies: Portfolios
create policy "Users can view their own portfolios"
  on public.portfolios for select
  using (auth.uid() = user_id);

create policy "Users can insert their own portfolios"
  on public.portfolios for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own portfolios"
  on public.portfolios for update
  using (auth.uid() = user_id);

create policy "Users can delete their own portfolios"
  on public.portfolios for delete
  using (auth.uid() = user_id);

-- RLS Policies: Positions
create policy "Users can view positions from their portfolios"
  on public.positions for select
  using (
    exists (
      select 1 from public.portfolios
      where id = portfolio_id and user_id = auth.uid()
    )
  );

create policy "Users can insert positions into their portfolios"
  on public.positions for insert
  with check (
    exists (
      select 1 from public.portfolios
      where id = portfolio_id and user_id = auth.uid()
    )
  );

create policy "Users can update positions in their portfolios"
  on public.positions for update
  using (
    exists (
      select 1 from public.portfolios
      where id = portfolio_id and user_id = auth.uid()
    )
  );

create policy "Users can delete positions from their portfolios"
  on public.positions for delete
  using (
    exists (
      select 1 from public.portfolios
      where id = portfolio_id and user_id = auth.uid()
    )
  );

-- RLS Policies: Notes
create policy "Users can view their own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- RLS Policies: Cached Quotes (read-only for authenticated users)
create policy "Authenticated users can view cached quotes"
  on public.cached_quotes for select
  using (auth.role() = 'authenticated');

create policy "Service role can manage cached quotes"
  on public.cached_quotes for all
  using (auth.role() = 'service_role');

-- RLS Policies: Cached Symbols (read-only for authenticated users)
create policy "Authenticated users can view cached symbols"
  on public.cached_symbols for select
  using (auth.role() = 'authenticated');

create policy "Service role can manage cached symbols"
  on public.cached_symbols for all
  using (auth.role() = 'service_role');

-- cached_sec_filings table (SEC EDGAR 10-K, 10-Q, 8-K)
create table if not exists public.cached_sec_filings (
  symbol text not null,
  type text not null,
  title text not null,
  date text not null,
  url text not null,
  updated_at timestamptz default now(),
  primary key (symbol, type)
);

-- RLS Policies: Cached SEC Filings (read-only for authenticated users)
alter table if exists public.cached_sec_filings enable row level security;

create policy "Authenticated users can view cached sec filings"
  on public.cached_sec_filings for select
  using (auth.role() = 'authenticated');

create policy "Service role can manage cached sec filings"
  on public.cached_sec_filings for all
  using (auth.role() = 'service_role');

create trigger update_cached_sec_filings_updated_at
  before update on public.cached_sec_filings
  for each row
  execute function public.update_updated_at_column();

-- cached_financial_metrics table (FMP Financial Ratios & Key Metrics)
create table if not exists public.cached_financial_metrics (
  symbol text primary key,
  -- Valuation
  pe_ratio numeric,
  pb_ratio numeric,
  ps_ratio numeric,
  peg_ratio numeric,
  ev_to_ebitda numeric,
  -- Profitability
  profit_margin numeric,
  operating_margin numeric,
  roe numeric,
  roa numeric,
  roic numeric,
  -- Growth
  revenue_growth numeric,
  earnings_growth numeric,
  eps_growth numeric,
  -- Financial Health
  current_ratio numeric,
  quick_ratio numeric,
  debt_to_equity numeric,
  -- Dividend
  dividend_yield numeric,
  payout_ratio numeric,
  -- Market
  beta numeric,
  shares_outstanding numeric,
  float_shares numeric,
  updated_at timestamptz default now()
);

-- RLS Policies: Cached Financial Metrics (read-only for authenticated users)
alter table if exists public.cached_financial_metrics enable row level security;

create policy "Authenticated users can view cached financial metrics"
  on public.cached_financial_metrics for select
  using (auth.role() = 'authenticated');

create policy "Service role can manage cached financial metrics"
  on public.cached_financial_metrics for all
  using (auth.role() = 'service_role');

create trigger update_cached_financial_metrics_updated_at
  before update on public.cached_financial_metrics
  for each row
  execute function public.update_updated_at_column();

-- Updated at triggers
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

create trigger update_watchlists_updated_at
  before update on public.watchlists
  for each row
  execute function public.update_updated_at_column();

create trigger update_portfolios_updated_at
  before update on public.portfolios
  for each row
  execute function public.update_updated_at_column();

create trigger update_positions_updated_at
  before update on public.positions
  for each row
  execute function public.update_updated_at_column();

create trigger update_notes_updated_at
  before update on public.notes
  for each row
  execute function public.update_updated_at_column();

create trigger update_cached_quotes_updated_at
  before update on public.cached_quotes
  for each row
  execute function public.update_updated_at_column();

create trigger update_cached_symbols_updated_at
  before update on public.cached_symbols
  for each row
  execute function public.update_updated_at_column();