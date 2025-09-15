"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bot } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "contact"
  timestamp: Date
  images?: string[]
  aiCaption?: string
  isTyping?: boolean
}

interface MessageBubbleProps {
  message: Message
  onImageClick: (images: string[], startIndex: number) => void
}

export function MessageBubble({ message, onImageClick }: MessageBubbleProps) {
  const isUser = message.sender === "user"

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} items-end space-x-2`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${isUser ? "order-1" : "order-2"}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
          }`}
        >
          {/* Images */}
          {message.images && message.images.length > 0 && (
            <div className="mb-2">
              {message.images.length === 1 ? (
                <img
                  src={message.images[0] || "/placeholder.svg"}
                  alt="Shared image"
                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onImageClick(message.images!, 0)}
                />
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {message.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Shared image ${index + 1}`}
                        className="rounded-lg w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onImageClick(message.images!, index)}
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
          {message.aiCaption && (
            <div className={`mb-2 p-2 rounded ${isUser ? "bg-blue-400" : "bg-gray-100"}`}>
              <div className="flex items-center space-x-1 mb-1">
                <Bot className="h-3 w-3" />
                <Badge variant="secondary" className="text-xs">
                  AI Caption
                </Badge>
              </div>
              <p className={`text-xs ${isUser ? "text-blue-100" : "text-gray-600"}`}>{message.aiCaption}</p>
            </div>
          )}

          {/* Message Text */}
          {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
        </div>

        <p className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : "text-left"}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
