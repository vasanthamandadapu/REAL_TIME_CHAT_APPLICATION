"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, ImageIcon, Paperclip, Smile, MoreVertical, Phone, Video, Search } from "lucide-react"
import { generateImageCaption } from "../lib/ai-caption"
import { PhotoViewer } from "./photo-viewer"
import { MessageBubble } from "./message-bubble"

interface Message {
  id: string
  text: string
  sender: "user" | "contact"
  timestamp: Date
  images?: string[]
  aiCaption?: string
  isTyping?: boolean
}

interface Contact {
  id: string
  name: string
  avatar: string
  lastSeen: string
  isOnline: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! How are you doing?",
      sender: "contact",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      text: "I'm doing great! Just working on some exciting projects.",
      sender: "user",
      timestamp: new Date(Date.now() - 3500000),
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [selectedContact] = useState<Contact>({
    id: "1",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastSeen: "last seen today at 2:30 PM",
    isOnline: true,
  })
  const [viewerImages, setViewerImages] = useState<string[]>([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedImages.length === 0) return

    const messageId = Date.now().toString()
    let imageUrls: string[] = []
    let aiCaption = ""

    // Convert selected images to URLs
    if (selectedImages.length > 0) {
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

    const message: Message = {
      id: messageId,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
      images: imageUrls.length > 0 ? imageUrls : undefined,
      aiCaption: aiCaption || undefined,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
    setSelectedImages([])

    // Simulate contact response
    setTimeout(
      () => {
        const responses = [
          "That's awesome!",
          "Nice photos! 📸",
          "Looks great!",
          "Thanks for sharing!",
          "Cool! Tell me more about it.",
        ]

        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "contact",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, response])
      },
      1000 + Math.random() * 2000,
    )
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
            <AvatarFallback>
              {selectedContact.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
            <p className="text-sm text-gray-500 flex items-center">
              {selectedContact.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>}
              {selectedContact.isOnline ? "Online" : selectedContact.lastSeen}
            </p>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onImageClick={openPhotoViewer} />
        ))}
        {isGeneratingCaption && (
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs">
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
              className="resize-none border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && selectedImages.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
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
