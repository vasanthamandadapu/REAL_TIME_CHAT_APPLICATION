import { redirect } from "next/navigation"
import { createServerClient } from "../lib/supabase-server"

export default async function HomePage() {
  try {
    const supabase = await createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect("/chat")
    } else {
      redirect("/login")
    }
  } catch (error) {
    if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
      console.error("Error checking session:", error)
    }
    redirect("/login")
  }
}
