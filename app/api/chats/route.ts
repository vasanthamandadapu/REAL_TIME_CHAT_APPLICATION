import { createServerClient } from "../../../lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: chats, error } = await supabase
      .from("chat_participants")
      .select(`
        chat_id,
        chats (
          id,
          name,
          type,
          avatar_url,
          created_at
        )
      `)
      .eq("user_id", session.user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ chats })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, type, participants } = await request.json()

    // Create chat
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({
        name: type === "group" ? name : null,
        type,
      })
      .select()
      .single()

    if (chatError) {
      return NextResponse.json({ error: chatError.message }, { status: 500 })
    }

    // Add participants
    const participantData = [
      { chat_id: newChat.id, user_id: session.user.id },
      ...participants.map((userId: string) => ({
        chat_id: newChat.id,
        user_id: userId,
      })),
    ]

    const { error: participantsError } = await supabase.from("chat_participants").insert(participantData)

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 })
    }

    return NextResponse.json({ chat: newChat })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
