import { redirect } from "next/navigation"
import { createServerClient } from "../lib/supabase-server"

export default async function HomePage() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect("/chat")
    } else {
      redirect("/login")
    }
  } catch (error) {
    console.error("Error checking session:", error)
    redirect("/login")
  }
}
