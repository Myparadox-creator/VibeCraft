import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export function getSupabaseCredentials() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("vibecraft_supabase_url");
    const customKey = localStorage.getItem("vibecraft_supabase_key");
    if (customUrl && customKey) {
      url = customUrl;
      key = customKey;
    }
  }

  return { url, key };
}

export function createClient() {
  const { url, key } = getSupabaseCredentials();
  const supabaseUrl = url || "https://placeholder-url.supabase.co";
  const supabaseAnonKey = key || "placeholder-anon-key";

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url !== "https://your-project.supabase.co" &&
    !url.includes("placeholder-url")
  );
}

export function setCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("vibecraft_supabase_url", url.trim());
    localStorage.setItem("vibecraft_supabase_key", key.trim());
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("vibecraft_supabase_url");
    localStorage.removeItem("vibecraft_supabase_key");
  }
}
