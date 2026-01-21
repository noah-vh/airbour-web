"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const createNewConversation = (): Conversation => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newConversation;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    let conversation = currentConversation;

    // Create new conversation if none exists
    if (!conversation) {
      conversation = createNewConversation();
      setConversations(prev => [...prev, conversation!]);
      setCurrentConversationId(conversation.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Update conversation with user message
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      title: conversation.messages.length === 0 ? inputValue.trim().slice(0, 50) : conversation.title,
      updatedAt: new Date(),
    };

    setConversations(prev =>
      prev.map(c => c.id === conversation.id ? updatedConversation : c)
    );

    setInputValue("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: conversation.id,
          context: "SysInno Innovation Monitoring System",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm here to help you analyze innovation signals and trends. How can I assist you today?",
        timestamp: new Date(),
      };

      // Update conversation with assistant response
      setConversations(prev =>
        prev.map(c =>
          c.id === conversation.id
            ? {
                ...c,
                messages: [...c.messages, userMessage, assistantMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );
    } catch (error) {
      // Fallback response for demo purposes
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm here to help you analyze innovation signals and trends in the SysInno system. I can help you understand market patterns, technology developments, and emerging opportunities. What would you like to know?",
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === conversation.id
            ? {
                ...c,
                messages: [...c.messages, userMessage, errorMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    const newConversation = createNewConversation();
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/50 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Conversations</h2>
            <Button
              onClick={handleNewConversation}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations yet. Start a new chat to begin.
              </div>
            ) : (
              conversations
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conversation.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setCurrentConversationId(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {conversation.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.messages.length} messages
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(conversation.updatedAt)}
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h1 className="font-semibold text-xl">{currentConversation.title}</h1>
                <Badge variant="secondary" className="ml-auto">
                  {currentConversation.messages.length} messages
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentConversation.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">Start a conversation</h3>
                      <p className="text-muted-foreground">
                        Ask me about innovation signals, market trends, or any insights from the data.
                      </p>
                    </div>
                  </div>
                ) : (
                  currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Analyzing your request...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about innovation signals, trends, or insights..."
                    disabled={isLoading}
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>SysInno AI Assistant</CardTitle>
                <CardDescription>
                  Get insights and analysis from your innovation data
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={handleNewConversation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>

                <div className="mt-6 text-left">
                  <h4 className="font-medium mb-2">Ask me about:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Innovation signals and trends</li>
                    <li>• Market analysis and insights</li>
                    <li>• Technology developments</li>
                    <li>• STEEP framework analysis</li>
                    <li>• Emerging opportunities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}