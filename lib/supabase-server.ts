import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerClient() {
  const cookieStore = cookies()

  // Your actual Supabase project credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ocismhcpgrnbcoxflsrl.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jaXNtaGNwZ3JuYmNveGZsc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDE1NTgsImV4cCI6MjA2ODU3NzU1OH0.TmgD1foaWshJttBBybB00n44HMz4i-J7PnukPW4IfEw"

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}
