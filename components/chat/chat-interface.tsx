"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { createClientClient } from "../../lib/supabase-client"

interface ChatInterfaceProps {
  user: User
}

export interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  email: string
  role: "user" | "admin"
  status: "online" | "offline"
  last_seen: string
}

export interface Chat {
  id: string
  name?: string
  type: "personal" | "group"
  participants: Profile[]
  last_message?: string
  last_message_time?: string
  unread_count: number
  avatar_url?: string
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientClient()

  useEffect(() => {
    loadUserProfile()
    loadChats()
  }, [user.id])

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const loadChats = async () => {
    try {
      setLoading(true)

      // Load user's chats
      const { data: chatData, error } = await supabase
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
        .eq("user_id", user.id)

      if (error) throw error

      // Transform and load chat details
      const chatPromises = chatData.map(async (item) => {
        const chat = item.chats

        // Get participants
        const { data: participants } = await supabase
          .from("chat_participants")
          .select(`
            profiles (
              id,
              full_name,
              avatar_url,
              email,
              role,
              status,
              last_seen
            )
          `)
          .eq("chat_id", chat.id)

        // Get last message
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("chat_id", chat.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        const chatParticipants = participants?.map((p) => p.profiles).filter(Boolean) || []

        // For personal chats, use the other participant's name
        let chatName = chat.name
        if (chat.type === "personal" && !chatName) {
          const otherParticipant = chatParticipants.find((p) => p.id !== user.id)
          chatName = otherParticipant?.full_name || "Unknown User"
        }

        return {
          id: chat.id,
          name: chatName,
          type: chat.type,
          participants: chatParticipants,
          last_message: lastMessage?.content || "",
          last_message_time: lastMessage?.created_at || chat.created_at,
          unread_count: 0, // TODO: Implement unread count
          avatar_url: chat.avatar_url,
        } as Chat
      })

      const resolvedChats = await Promise.all(chatPromises)
      setChats(resolvedChats)
    } catch (error) {
      console.error("Error loading chats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar
        user={profile}
        chats={chats}
        selectedChat={selectedChat}
        onChatSelect={setSelectedChat}
        onChatsUpdate={loadChats}
        loading={loading}
      />
      <ChatWindow selectedChat={selectedChat} currentUser={profile} onChatUpdate={loadChats} />
    </div>
  )
}
