import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uqwzuerpfjgcxjiizouu.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxd3p1ZXJwZmpnY3hqaWl6b3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDQxNjksImV4cCI6MjA3NjcyMDAxNjl9.uUJnKX3lyorPJODjppJec-nI93yPEuhPJ5THwJTt4Ew"

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}
