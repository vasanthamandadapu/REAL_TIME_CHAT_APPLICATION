import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClientClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uqwzuerpfjgcxjiizouu.supabase.co"
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxd3p1ZXJwZmpnY3hqaWl6b3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDQxNjksImV4cCI6MjA3NjcyMDAxNjl9.uUJnKX3lyorPJODjppJec-nI93yPEuhPJ5THwJTt4Ew"

    console.log("Creating Supabase client with:", {
      url: supabaseUrl,
      key: supabaseAnonKey ? "✅ Present" : "❌ Missing",
    })

    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}
