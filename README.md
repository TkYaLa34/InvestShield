# US Investor Research Webapp

Mobile-first webapp for US stock and ETF research, designed for mid-to-long term investors.

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — PostgreSQL, Auth, Storage, Row Level Security
- [Vercel](https://vercel.com/) — Deployment
- [Mistral AI](https://mistral.ai/) — AI Research Assistant

## MVP Features

- Dashboard
- Watchlist (CRUD)
- Portfolio & Positions (CRUD)
- Stock Research page
- ETF Research page
- Technical chart & indicators
- Fundamental metrics & valuation
- SEC filings viewer/summary
- AI Research Assistant (Mistral API)
- News feed per ticker
- Research notes
- Stock/ETF screener

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- Mistral API key (optional, for AI features)

### 1. Clone and install

```bash
git clone https://github.com/TkYaLa34/InvestShield.git
cd InvestShield
git checkout feat/mvp-foundation
npm install
```

### 2. Environment setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Never commit `.env.local`.** It is already in `.gitignore`.

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |
| `MISTRAL_API_KEY` | Mistral AI API key (for AI Research Assistant) |
| `FINNHUB_API_KEY` | Finnhub API key (market data, free tier) |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `http://localhost:3000`) |

### 3. Database setup

Run the schema migration in your Supabase SQL Editor:

```sql
-- contents of database/schema.sql
```

This creates all tables (`profiles`, `watchlists`, `watchlist_items`, `portfolios`, `positions`, `notes`, `cached_quotes`, `cached_symbols`) with Row Level Security enabled.

### 4. Auth setup (Supabase Dashboard)

1. Go to **Authentication > Settings** in your Supabase project
2. Enable **Email/Password** authentication
3. Enable **Google OAuth** and add your Google Client ID & Secret
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-app.vercel.app/auth/callback` (production)

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
app/                    # Next.js App Router pages
  page.tsx              # Dashboard (root)
  dashboard/            # Dashboard page
  watchlist/            # Watchlist page
  portfolio/            # Portfolio page
  research/[ticker]/    # Stock/ETF research page
  settings/             # Settings page
  auth/
    sign-in/            # Sign in page
    sign-up/            # Sign up page
  layout.tsx            # Root layout
  globals.css           # Global styles
components/             # React components
  layout.tsx            # Navigation layout
  ui.tsx                # Shared UI (disclaimer, headers)
lib/                    # Utility libraries
  supabase/
    server.ts           # Supabase server client
    client.ts           # Supabase browser client
    middleware.ts       # Auth middleware
types/                  # TypeScript types
  database.ts           # Supabase database types
database/
  schema.sql            # PostgreSQL schema with RLS
```

## Disclaimer

This webapp is for informational and educational purposes only. It does not
constitute financial advice, investment recommendations, or an offer to buy or
sell any securities. Market data may be delayed and is not guaranteed to be
accurate. Always consult with a qualified financial advisor before making
investment decisions. Investing involves risk, including loss of principal.

## License

MIT License