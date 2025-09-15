"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, ImageIcon, Paperclip, Smile, MoreVertical, Phone, Video, Search, Users, Bot } from "lucide-react"
import type { Profile, Chat } from "./chat-interface"
import { generateImageCaption } from "../../lib/ai-caption"
import { PhotoViewer } from "../photo-viewer"
import { createClientClient } from "../../lib/supabase-client"

interface Message {
  id: string
  content: string
  sender_id: string
  chat_id: string
  created_at: string
  images?: string[]
  ai_caption?: string
  sender?: Profile
}

interface ChatWindowProps {
  selectedChat: Chat | null
  currentUser: Profile
  onChatUpdate: () => void
}

export function ChatWindow({ selectedChat, currentUser, onChatUpdate }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [loading, setLoading] = useState(false)
  const [viewerImages, setViewerImages] = useState<string[]>([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientClient()

  useEffect(() => {
    if (selectedChat) {
      loadMessages()
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    if (!selectedChat) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true })

      if (error) throw error

      const messagesWithSender = data.map((msg) => ({
        ...msg,
        sender: msg.profiles,
      }))

      setMessages(messagesWithSender)
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedChat || (!newMessage.trim() && selectedImages.length === 0)) return

    try {
      let imageUrls: string[] = []
      let aiCaption = ""

      // Handle image uploads
      if (selectedImages.length > 0) {
        // In a real app, you would upload images to storage
        imageUrls = selectedImages.map((file) => URL.createObjectURL(file))

        // Generate AI caption for the first image
        if (selectedImages[0]) {
          setIsGeneratingCaption(true)
          try {
            aiCaption = await generateImageCaption(selectedImages[0])
          } catch (error) {
            console.error("Failed to generate caption:", error)
            aiCaption = "Unable to generate caption for this image."
          }
          setIsGeneratingCaption(false)
        }
      }

      // Insert message into database
      const { error } = await supabase.from("messages").insert({
        content: newMessage,
        sender_id: currentUser.id,
        chat_id: selectedChat.id,
        images: imageUrls.length > 0 ? imageUrls : null,
        ai_caption: aiCaption || null,
      })

      if (error) throw error

      // Clear form
      setNewMessage("")
      setSelectedImages([])

      // Reload messages
      await loadMessages()
      onChatUpdate()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedImages((prev) => [...prev, ...files])
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const openPhotoViewer = (images: string[], startIndex = 0) => {
    setViewerImages(images)
    setCurrentImageIndex(startIndex)
    setViewerOpen(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getChatInfo = () => {
    if (!selectedChat) return null

    if (selectedChat.type === "personal") {
      const otherParticipant = selectedChat.participants.find((p) => p.id !== currentUser.id)
      return {
        name: otherParticipant?.full_name || "Unknown User",
        subtitle: otherParticipant?.status === "online" ? "Online" : `Last seen ${otherParticipant?.last_seen}`,
        avatar: otherParticipant?.avatar_url,
      }
    } else {
      return {
        name: selectedChat.name || "Group Chat",
        subtitle: `${selectedChat.participants.length} participants`,
        avatar: selectedChat.avatar_url,
      }
    }
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to ChatApp</h3>
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  const chatInfo = getChatInfo()

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chatInfo?.avatar || "/placeholder.svg"} alt={chatInfo?.name} />
            <AvatarFallback>{getAvatarFallback(chatInfo?.name || "")}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center">
              {chatInfo?.name}
              {selectedChat.type === "group" && <Users className="w-4 h-4 ml-2 text-gray-500" />}
            </h2>
            <p className="text-sm text-gray-500">{chatInfo?.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUser.id
            const sender = message.sender || currentUser

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} items-end space-x-2`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sender.avatar_url || "/placeholder.svg"} alt={sender.full_name} />
                    <AvatarFallback>{getAvatarFallback(sender.full_name)}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "order-1" : "order-2"}`}>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? "bg-green-500 text-white rounded-br-sm"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {/* Sender name for group chats */}
                    {!isCurrentUser && selectedChat.type === "group" && (
                      <p className="text-xs font-medium text-gray-600 mb-1">{sender.full_name}</p>
                    )}

                    {/* Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="mb-2">
                        {message.images.length === 1 ? (
                          <img
                            src={message.images[0] || "/placeholder.svg"}
                            alt="Shared image"
                            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openPhotoViewer(message.images!, 0)}
                          />
                        ) : (
                          <div className="grid grid-cols-2 gap-1">
                            {message.images.slice(0, 4).map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Shared image ${index + 1}`}
                                  className="rounded-lg w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => openPhotoViewer(message.images!, index)}
                                />
                                {index === 3 && message.images!.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-semibold">+{message.images!.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Caption */}
                    {message.ai_caption && (
                      <div className={`mb-2 p-2 rounded ${isCurrentUser ? "bg-green-400" : "bg-gray-100"}`}>
                        <div className="flex items-center space-x-1 mb-1">
                          <Bot className="h-3 w-3" />
                          <Badge variant="secondary" className="text-xs">
                            AI Caption
                          </Badge>
                        </div>
                        <p className={`text-xs ${isCurrentUser ? "text-green-100" : "text-gray-600"}`}>
                          {message.ai_caption}
                        </p>
                      </div>
                    )}

                    {/* Message Content */}
                    {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
                  </div>

                  <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {isGeneratingCaption && (
          <div className="flex justify-end">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Generating AI caption...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Selected Images ({selectedImages.length})</span>
            <Badge variant="secondary" className="text-xs">
              AI Caption will be generated
            </Badge>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Selected ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeSelectedImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="resize-none border-gray-300 focus:border-green-500"
            />
          </div>

          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && selectedImages.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />

      {/* Photo Viewer */}
      <PhotoViewer
        images={viewerImages}
        currentIndex={currentImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  )
}
