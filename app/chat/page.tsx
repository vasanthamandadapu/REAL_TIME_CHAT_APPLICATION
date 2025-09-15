import { redirect } from "next/navigation"
import { createServerClient } from "../../lib/supabase-server"
import ChatInterface from "../../components/chat/chat-interface"

export default async function ChatPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return <ChatInterface user={session.user} />
}
