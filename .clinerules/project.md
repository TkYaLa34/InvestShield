# InvestShield — Project Rules & Conventions

This document defines the coding standards, folder structure, and conventions for the InvestShield project (US Investor Research Webapp).

## 1. Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend/Auth/Database**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Deployment**: Vercel
- **AI**: Mistral AI (optional, for AI Research Assistant)
- **Market Data**: Finnhub API (free tier)

## 2. Folder Structure

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
  # Additional component subfolders as needed:
  #   ui/               # Base UI components (shadcn-style)
  #   watchlist/        # Watchlist-specific components
  #   portfolio/        # Portfolio-specific components
  #   research/         # Research page components

database/               # Database schema & migrations
  schema.sql            # PostgreSQL schema with Row Level Security

hooks/                  # Custom React hooks
  # Example: useAuth.ts, useWatchlist.ts, usePortfolio.ts, useMarketData.ts

lib/                    # Utility libraries
  supabase/             # Supabase clients
    server.ts           # Supabase server client
    client.ts           # Supabase browser client
    middleware.ts       # Auth middleware
  utils.ts              # General utility functions

types/                  # TypeScript type definitions
  database.ts           # Supabase database types (generated from schema)
  index.ts              # Type re-exports

.env.example            # Example environment variables (never commit .env.local)
.gitignore              # Git ignore rules
next.config.ts          # Next.js configuration
tailwind.config.ts      # Tailwind configuration
tsconfig.json           # TypeScript configuration
package.json            # Dependencies & scripts
```

## 3. Environment Variables

Required variables (in `.env.local`):

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | App URL | `http://localhost:3000` |
| `MISTRAL_API_KEY` | Mistral AI API key (optional) | `...` |
| `FINNHUB_API_KEY` | Finnhub API key (market data) | `...` |

**Never commit `.env.local`.** It is already in `.gitignore`.

## 4. Supabase Client Usage

### Browser Client (Client Components)
```typescript
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

### Server Client (Server Components)
```typescript
import { createClient } from "@/lib/supabase/server";
const supabase = createClient();
```

### Middleware (Auth)
```typescript
import { middleware } from "@/lib/supabase/middleware";
```

## 5. TypeScript Conventions

- Use `Database` type from `@/types/database` for all Supabase operations
- Export types from `@/types/index`
- Prefer explicit type annotations over `any`
- Use `Row`, `Insert`, `Update` types from the `Database` type for table operations

## 6. Commit Convention

Use conventional commit prefixes:

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, missing semicolons, etc. |
| `refactor:` | Code refactoring without feature change |
| `test:` | Adding tests |
| `chore:` | Build, config, dependency changes |

Example: `feat: add Supabase client connection and database types`

## 7. Database Schema

Tables defined in `database/schema.sql`:

- `profiles` — User profiles linked to `auth.users`
- `watchlists` — User watchlists
- `watchlist_items` — Symbols in watchlists
- `portfolios` — User portfolios
- `positions` — Stock/ETF positions in portfolios
- `notes` — Research notes per symbol
- `cached_quotes` — Cached market data
- `cached_symbols` — Cached symbol metadata

All tables have Row Level Security (RLS) enabled with policies restricting access to the data owner.

## 8. Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## 9. Disclaimer

This webapp is for informational and educational purposes only. It does not constitute financial advice, investment recommendations, or an offer to buy or sell any securities. Always consult with a qualified financial advisor before making investment decisions.