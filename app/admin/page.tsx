import { redirect } from "next/navigation"
import { createServerClient } from "../../lib/supabase-server"
import AdminDashboard from "../../components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/chat")
  }

  return <AdminDashboard />
}
