"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, MessageCircle, Sparkles, Heart } from "lucide-react"
import type { Profile } from "./chat-interface"
import { createClientClient } from "../../lib/supabase-client"

interface CreateChatDialogProps {
  currentUser: Profile
  onChatCreated: () => void
}

export function CreateChatDialog({ currentUser, onChatCreated }: CreateChatDialogProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClientClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").neq("id", currentUser.id)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
      setError("Failed to load users")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const createPersonalChat = async (otherUserId: string) => {
    try {
      setLoading(true)
      setError("")

      console.log("Creating personal chat with user:", otherUserId)

      // First, create the chat
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          type: "personal",
        })
        .select()
        .single()

      if (chatError) {
        console.error("Error creating chat:", chatError)
        throw chatError
      }

      console.log("Chat created:", newChat)

      // Then add participants
      const { error: participantsError } = await supabase.from("chat_participants").insert([
        { chat_id: newChat.id, user_id: currentUser.id },
        { chat_id: newChat.id, user_id: otherUserId },
      ])

      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        throw participantsError
      }

      console.log("Participants added successfully")
      onChatCreated()
    } catch (error) {
      console.error("Error creating personal chat:", error)
      setError("Failed to create chat. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      setError("Please enter a group name and select at least one user")
      return
    }

    try {
      setLoading(true)
      setError("")

      console.log("Creating group chat:", { name: groupName, participants: selectedUsers })

      // Create group chat
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          name: groupName,
          type: "group",
        })
        .select()
        .single()

      if (chatError) {
        console.error("Error creating group chat:", chatError)
        throw chatError
      }

      console.log("Group chat created:", newChat)

      // Add participants (including current user)
      const participants = [
        { chat_id: newChat.id, user_id: currentUser.id },
        ...selectedUsers.map((userId) => ({
          chat_id: newChat.id,
          user_id: userId,
        })),
      ]

      const { error: participantsError } = await supabase.from("chat_participants").insert(participants)

      if (participantsError) {
        console.error("Error adding group participants:", participantsError)
        throw participantsError
      }

      console.log("Group participants added successfully")
      onChatCreated()
    } catch (error) {
      console.error("Error creating group chat:", error)
      setError("Failed to create group chat. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-100 to-pink-100">
          <TabsTrigger
            value="personal"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Personal Chat
          </TabsTrigger>
          <TabsTrigger
            value="group"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Group Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 border-purple-200 focus:border-purple-400 focus:ring-purple-200 rounded-xl"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-purple-200"
                onClick={() => createPersonalChat(user.id)}
              >
                <Avatar className="h-12 w-12 ring-2 ring-purple-200">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
                    {getAvatarFallback(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${user.status === "online" ? "bg-emerald-400" : "bg-gray-300"}`}
                  ></div>
                  <span className="text-xs text-gray-500 font-medium">{user.status}</span>
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="group" className="space-y-4">
          <Input
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-white/70 border-purple-200 focus:border-purple-400 focus:ring-purple-200 rounded-xl"
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 border-purple-200 focus:border-purple-400 focus:ring-purple-200 rounded-xl"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-200"
              >
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleUserToggle(user.id)}
                  className="border-purple-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <Avatar className="h-12 w-12 ring-2 ring-purple-200">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
                    {getAvatarFallback(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${user.status === "online" ? "bg-emerald-400" : "bg-gray-300"}`}
                  ></div>
                  <span className="text-xs text-gray-500 font-medium">{user.status}</span>
                  <Heart className="h-4 w-4 text-pink-400" />
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={createGroupChat}
            disabled={!groupName.trim() || selectedUsers.length === 0 || loading}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 rounded-xl"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Group ({selectedUsers.length} members)
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
