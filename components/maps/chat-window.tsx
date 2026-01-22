"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Minimize2, Maximize2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Signal } from "@/lib/maps/types"

interface ChatWindowProps {
  signals: Signal[]
  mobile: boolean
  isMinimized?: boolean
  onToggleMinimized?: () => void
  onChatStart?: () => void
  onChatStateChange?: (hasStarted: boolean) => void
}

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export function ChatWindow({
  signals,
  mobile,
  isMinimized = false,
  onToggleMinimized,
  onChatStart,
  onChatStateChange
}: ChatWindowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    onChatStateChange?.(messages.length > 0)
  }, [messages.length, onChatStateChange])

  const handleOpen = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      onChatStart?.()
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hello! I can help you analyze and understand the signals on this innovation map. I have access to ${signals.length} signals across different categories. What would you like to know?`,
        sender: "assistant",
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${userMessage.content}". While I don't have a full AI integration yet, I can see you have ${signals.length} signals in the current view. This is a placeholder response that would normally be powered by an AI model analyzing your innovation signals.`,
        sender: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <div className={`absolute ${mobile ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-30`}>
        <Button
          onClick={handleOpen}
          className="backdrop-blur-[16px] bg-blue-500/80 hover:bg-blue-600/80 text-white border border-blue-400/30 shadow-elevated p-3 rounded-full transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`absolute ${mobile ? 'bottom-6 left-6 right-6' : 'bottom-6 right-6'} z-30`}>
      <div className={`backdrop-blur-[16px] bg-white/60 dark:bg-black/60 border border-[var(--border)] rounded-lg shadow-elevated ${mobile ? 'w-full h-[400px]' : 'w-96 h-[500px]'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            {!mobile && onToggleMinimized && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleMinimized}
                className="p-1 h-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="p-1 h-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--accent)] text-[var(--accent-foreground)] p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about the signals..."
                  className="flex-1 bg-transparent border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}