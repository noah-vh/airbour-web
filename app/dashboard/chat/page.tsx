"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, Trash2, Plus, Bot, User2, Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
          context: "Airbour Innovation Monitoring System",
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
        content: "I'm here to help you analyze innovation signals and trends in the Airbour system. I can help you understand market patterns, technology developments, and emerging opportunities. What would you like to know?",
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
    <div className="min-h-screen">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-muted border border-blue/30">
                <MessageSquare className="h-6 w-6 text-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
                <p className="text-sm text-muted-foreground">Innovation Intelligence Chat</p>
              </div>
            </div>
            <button
              onClick={handleNewConversation}
              className="w-full bg-blue-muted border border-blue/20 rounded-lg px-4 py-3 transition-colors hover:bg-blue/20 flex items-center gap-3"
            >
              <Plus className="h-5 w-5 text-blue" />
              <span className="text-blue font-medium">New Conversation</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No conversations yet. Start a new chat to begin exploring insights.
                  </p>
                </div>
              ) : (
                conversations
                  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                  .map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ y: -2 }}
                      className={`group relative p-4 rounded-lg cursor-pointer transition-colors ${
                        currentConversationId === conversation.id
                          ? "bg-blue-muted border border-blue/30"
                          : "bg-muted border border-border hover:bg-muted/80 hover:border-blue/20"
                      }`}
                      onClick={() => setCurrentConversationId(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground truncate mb-2">
                            {conversation.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {conversation.messages.length}
                            </span>
                            <span>{formatTime(conversation.updatedAt)}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id);
                          }}
                          className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-muted border border-blue/30">
                    <Brain className="h-4 w-4 text-blue" />
                  </div>
                  <div className="flex-1">
                    <h1 className="font-semibold text-lg text-foreground">{currentConversation.title}</h1>
                    <p className="text-sm text-muted-foreground">AI-powered innovation insights</p>
                  </div>
                  <div className="px-3 py-1 bg-green-muted text-green-400 border border-green-400/20 rounded-lg text-sm font-medium">
                    {currentConversation.messages.length} messages
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {currentConversation.messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center h-64"
                    >
                      <div className="text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-muted border border-purple/30 mx-auto mb-6">
                          <Sparkles className="h-8 w-8 text-purple" />
                        </div>
                        <h3 className="font-medium text-xl text-foreground mb-3">Ready to explore insights</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                          Ask me about innovation signals, market trends, STEEP analysis, or any insights from your data.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                          <button
                            onClick={() => setInputValue("What are the emerging technology trends?")}
                            className="bg-blue-muted border border-blue/20 rounded-lg p-3 text-left transition-colors hover:bg-blue/20"
                          >
                            <p className="text-sm text-blue font-medium">Technology Trends</p>
                            <p className="text-xs text-muted-foreground mt-1">Explore emerging tech signals</p>
                          </button>
                          <button
                            onClick={() => setInputValue("Analyze market opportunities in our data")}
                            className="bg-green-muted border border-green-400/20 rounded-lg p-3 text-left transition-colors hover:bg-green-400/20"
                          >
                            <p className="text-sm text-green-400 font-medium">Market Analysis</p>
                            <p className="text-xs text-muted-foreground mt-1">Discover market opportunities</p>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    currentConversation.messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-muted border border-purple/30 flex-shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-purple" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] ${
                            message.role === "user"
                              ? "bg-blue-muted border border-blue/30 rounded-lg p-4"
                              : "bg-card border border-border rounded-lg p-4"
                          }`}
                        >
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-3">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-muted border border-blue/30 flex-shrink-0 mt-1">
                            <User2 className="h-4 w-4 text-blue" />
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 justify-start"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-muted border border-purple/30 flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-purple" />
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-blue" />
                          <span className="text-sm text-muted-foreground">
                            Analyzing your request and gathering insights...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-border">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Ask about innovation signals, trends, or insights..."
                          disabled={isLoading}
                          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:bg-muted/80 transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-blue-muted border border-blue/30 rounded-lg p-3 transition-colors hover:bg-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue" />
                      ) : (
                        <Send className="h-5 w-5 text-blue" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Press Enter to send your message • AI-powered innovation intelligence
                  </p>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <div className="bg-card border border-border rounded-lg p-8 max-w-lg w-full text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-muted to-purple-muted border border-blue/30 mx-auto mb-6">
                  <Brain className="h-8 w-8 text-blue" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">Airbour AI Assistant</h2>
                <p className="text-muted-foreground mb-8">
                  Get intelligent insights and analysis from your innovation data using advanced AI
                </p>

                <button
                  onClick={handleNewConversation}
                  className="w-full bg-blue-muted border border-blue/30 rounded-lg px-6 py-4 transition-colors hover:bg-blue/30 flex items-center justify-center gap-3 mb-8"
                >
                  <Plus className="h-5 w-5 text-blue" />
                  <span className="text-blue font-medium">Start New Conversation</span>
                </button>

                <div className="text-left">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple" />
                    Ask me about:
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Innovation signals and emerging trends
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      Market analysis and competitive insights
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      Technology developments and disruptions
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-purple"></div>
                      STEEP framework analysis
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      Strategic opportunities and recommendations
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}