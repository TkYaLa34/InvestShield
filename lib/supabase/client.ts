import type { Database } from "@/types/database";
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}