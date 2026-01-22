import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listConversations = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    // For now, return mock conversations
    // In production, this would query the chat_conversations table
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      _id: `conv_${offset + i + 1}`,
      title: `Conversation ${offset + i + 1}`,
      lastMessage: `Last message in conversation ${offset + i + 1}`,
      lastMessageAt: Date.now() - Math.random() * 86400000 * 7, // Random within last week
      messageCount: Math.floor(Math.random() * 20) + 1,
      createdAt: Date.now() - Math.random() * 86400000 * 30, // Random within last month
      updatedAt: Date.now() - Math.random() * 86400000,
    }));
  },
});

export const getConversation = query({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock conversation with messages
    // In production, this would query the chat_conversations table and related messages
    const mockMessages = Array.from({ length: 5 }, (_, i) => ({
      _id: `msg_${i + 1}`,
      content: `Message ${i + 1} content`,
      role: i % 2 === 0 ? "user" : "assistant",
      timestamp: Date.now() - (5 - i) * 60000, // 1 minute apart
      conversationId: args.conversationId,
    }));

    return {
      _id: args.conversationId,
      title: `Conversation Title`,
      messages: mockMessages,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 60000,
      messageCount: mockMessages.length,
    };
  },
});

export const createConversation = mutation({
  args: {
    title: v.optional(v.string()),
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversationId = `conv_${Date.now()}`;
    const now = Date.now();

    // For now, return mock created conversation
    // In production, this would insert into chat_conversations table
    const conversation = {
      _id: conversationId,
      title: args.title || "New Conversation",
      createdAt: now,
      updatedAt: now,
      messageCount: args.initialMessage ? 1 : 0,
    };

    if (args.initialMessage) {
      // In production, this would also create the initial message
      conversation.messageCount = 1;
    }

    return conversation;
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    const messageId = `msg_${Date.now()}`;
    const now = Date.now();

    // For now, return mock created message
    // In production, this would insert into messages table and update conversation
    return {
      _id: messageId,
      conversationId: args.conversationId,
      content: args.content,
      role: args.role,
      timestamp: now,
      createdAt: now,
    };
  },
});

export const updateConversationTitle = mutation({
  args: {
    conversationId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return success
    // In production, this would update the chat_conversations table
    return {
      _id: args.conversationId,
      title: args.title,
      updatedAt: Date.now(),
    };
  },
});

export const deleteConversation = mutation({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return success
    // In production, this would delete from chat_conversations and related messages
    return {
      deleted: true,
      conversationId: args.conversationId,
    };
  },
});