import { createBrowserClient, type Database } from "@/types/database";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Fallback: use @supabase/supabase-js directly if auth-helpers is not available
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}