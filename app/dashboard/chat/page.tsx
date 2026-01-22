"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, Trash2, Plus, Bot, User2, Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/dashboard/sidebar-context";
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
  const { isCollapsed } = useSidebar();
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
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 glass bg-[#0a0a0a]/80 border-r border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                <MessageSquare className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#f5f5f5]">AI Assistant</h2>
                <p className="text-sm text-[#a3a3a3]">Innovation Intelligence Chat</p>
              </div>
            </div>
            <button
              onClick={handleNewConversation}
              className="w-full glass bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3 transition-standard hover:bg-purple-500/20 flex items-center gap-3"
            >
              <Plus className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 font-medium">New Conversation</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <Bot className="h-12 w-12 text-[#666] mx-auto mb-3" />
                  <p className="text-[#a3a3a3] text-sm">
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
                      className={`group relative p-4 rounded-lg cursor-pointer transition-standard ${
                        currentConversationId === conversation.id
                          ? "glass bg-purple-500/20 border border-purple-500/30"
                          : "glass bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/20"
                      }`}
                      onClick={() => setCurrentConversationId(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-[#f5f5f5] truncate mb-2">
                            {conversation.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-[#a3a3a3]">
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
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Brain className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h1 className="font-semibold text-lg text-[#f5f5f5]">{currentConversation.title}</h1>
                    <p className="text-sm text-[#a3a3a3]">AI-powered innovation insights</p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/10 text-green-300 border border-green-500/20 rounded-lg text-sm font-medium">
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
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30 mx-auto mb-6">
                          <Sparkles className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="font-medium text-xl text-[#f5f5f5] mb-3">Ready to explore insights</h3>
                        <p className="text-[#a3a3a3] mb-6 max-w-md">
                          Ask me about innovation signals, market trends, STEEP analysis, or any insights from your data.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                          <button
                            onClick={() => setInputValue("What are the emerging technology trends?")}
                            className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-left transition-standard hover:bg-blue-500/20"
                          >
                            <p className="text-sm text-blue-300 font-medium">Technology Trends</p>
                            <p className="text-xs text-[#a3a3a3] mt-1">Explore emerging tech signals</p>
                          </button>
                          <button
                            onClick={() => setInputValue("Analyze market opportunities in our data")}
                            className="glass bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-left transition-standard hover:bg-green-500/20"
                          >
                            <p className="text-sm text-green-300 font-medium">Market Analysis</p>
                            <p className="text-xs text-[#a3a3a3] mt-1">Discover market opportunities</p>
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
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 flex-shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-purple-400" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] ${
                            message.role === "user"
                              ? "glass bg-blue-500/20 border border-blue-500/30 rounded-lg p-4"
                              : "glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4"
                          }`}
                        >
                          <p className="text-sm leading-relaxed text-[#f5f5f5] whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs text-[#a3a3a3] mt-3">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30 flex-shrink-0 mt-1">
                            <User2 className="h-4 w-4 text-blue-400" />
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                          <span className="text-sm text-[#a3a3a3]">
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
              <div className="p-6 border-t border-white/5">
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
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[#f5f5f5] placeholder:text-[#666] focus:outline-none focus:border-purple-500/30 focus:bg-white/10 transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="glass bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 transition-standard hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                      ) : (
                        <Send className="h-5 w-5 text-purple-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#666] mt-3 text-center">
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
              <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-8 max-w-lg w-full text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mx-auto mb-6">
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-[#f5f5f5] mb-3">SysInno AI Assistant</h2>
                <p className="text-[#a3a3a3] mb-8">
                  Get intelligent insights and analysis from your innovation data using advanced AI
                </p>

                <button
                  onClick={handleNewConversation}
                  className="w-full glass bg-purple-500/20 border border-purple-500/30 rounded-lg px-6 py-4 transition-standard hover:bg-purple-500/30 flex items-center justify-center gap-3 mb-8"
                >
                  <Plus className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-300 font-medium">Start New Conversation</span>
                </button>

                <div className="text-left">
                  <h4 className="font-medium text-[#f5f5f5] mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    Ask me about:
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-[#a3a3a3]">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Innovation signals and emerging trends
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#a3a3a3]">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      Market analysis and competitive insights
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#a3a3a3]">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      Technology developments and disruptions
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#a3a3a3]">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      STEEP framework analysis
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#a3a3a3]">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
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