"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  MoreVertical,
  Plus,
  Shield,
  Sparkles,
  Heart,
} from "lucide-react"
import type { Profile, Chat } from "./chat-interface"
import { CreateChatDialog } from "./create-chat-dialog"
import { createClientClient } from "../../lib/supabase-client"

interface ChatSidebarProps {
  user: Profile
  chats: Chat[]
  selectedChat: Chat | null
  onChatSelect: (chat: Chat) => void
  onChatsUpdate: () => void
  loading: boolean
}

export function ChatSidebar({ user, chats, selectedChat, onChatSelect, onChatsUpdate, loading }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const router = useRouter()
  const supabase = createClientClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const filteredChats = chats.filter((chat) => chat.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.avatar_url) return chat.avatar_url

    if (chat.type === "personal") {
      const otherParticipant = chat.participants.find((p) => p.id !== user.id)
      return otherParticipant?.avatar_url || "/placeholder.svg?height=40&width=40"
    }

    return "/placeholder.svg?height=40&width=40"
  }

  return (
    <div className="w-80 bg-gradient-to-b from-purple-50 via-pink-50 to-rose-50 border-r border-purple-200/50 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-purple-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-purple-200">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
                  {getAvatarFallback(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{user.full_name}</h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 font-medium">Online</span>
                </div>
                {user.role === "admin" && (
                  <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-purple-100/50">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm border-purple-200">
              <DropdownMenuItem className="hover:bg-purple-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem onClick={() => router.push("/admin")} className="hover:bg-purple-50">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/70 border-purple-200 focus:border-purple-400 focus:ring-purple-200 rounded-xl"
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-purple-200/50 bg-white/30">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              <Sparkles className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/90 backdrop-blur-sm border-purple-200">
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Chat
              </DialogTitle>
            </DialogHeader>
            <CreateChatDialog
              currentUser={user}
              onChatCreated={() => {
                setShowCreateDialog(false)
                onChatsUpdate()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-3 text-sm text-purple-600 font-medium">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-purple-600 font-medium">No chats found</p>
            <p className="text-sm text-purple-400 mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`p-4 hover:bg-white/50 cursor-pointer rounded-xl border-l-4 transition-all duration-200 ${
                  selectedChat?.id === chat.id
                    ? "bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400 shadow-md"
                    : "border-transparent hover:shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src={getChatAvatar(chat) || "/placeholder.svg"} alt={chat.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-white font-semibold">
                        {getAvatarFallback(chat.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    {chat.type === "group" && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                        <Users className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                      {chat.last_message_time && (
                        <span className="text-xs text-purple-500 font-medium">
                          {formatTime(chat.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{chat.last_message || "No messages yet"}</p>
                      {chat.unread_count > 0 && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs border-0">
                          {chat.unread_count}
                        </Badge>
                      )}
                    </div>
                    {chat.type === "group" && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Heart className="h-3 w-3 text-pink-400" />
                        <p className="text-xs text-pink-500 font-medium">{chat.participants.length} members</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
