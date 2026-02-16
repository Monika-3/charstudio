import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Export a singleton instance so you can do: import { supabase } from "@/lib/supabase"
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Also export a factory function if needed elsewhere
export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);
