import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User table - for Clerk integration
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),       // Synced from Clerk
    image: v.optional(v.string()),      // Synced from Clerk
    clerkId: v.string(),                // Clerk User ID - will be present for all users managed by Clerk
    // createdAt: v.optional(v.number()), // Optional: if you want to store Clerk's user creation timestamp
                                        // Convex automatically provides _creationTime for record creation in Convex
  })
  .index("by_email", ["email"])
  .index("by_clerk_id", ["clerkId"]), // Essential for linking to Clerk

  // Chat table
  chats: defineTable({
    createdAt: v.number(), // timestamp as number
    title: v.string(),
    userId: v.id("users"), // reference to users table
    visibility: v.string(), // "public" or "private"
    updatedAt: v.optional(v.number()), // timestamp as number
  }).index("by_user", ["userId"]),

  // Message table
  messages: defineTable({
    chatId: v.id("chats"), // reference to chats table
    role: v.string(), // "user", "assistant", "system", etc.
    content: v.optional(v.string()), // for simple messages
    parts: v.optional(v.any()), // JSON data for complex messages
    attachments: v.optional(v.array(v.any())), // JSON array
    createdAt: v.number(), // timestamp as number
  }).index("by_chat", ["chatId"]),

  // Vote table
  votes: defineTable({
    chatId: v.id("chats"), // reference to chats table
    messageId: v.id("messages"), // reference to messages table
    userId: v.id("users"), // reference to users table
    isUpvoted: v.boolean(),
  }).index("by_chat_message", ["chatId", "messageId"])
    .index("by_user", ["userId"]),

  // Document table
  documents: defineTable({
    createdAt: v.number(), // timestamp as number
    title: v.string(),
    content: v.optional(v.string()),
    kind: v.string(), // "text", "code", "image", "sheet"
    userId: v.id("users"), // reference to users table
    updatedAt: v.optional(v.number()), // timestamp as number
  }).index("by_user", ["userId"]),

  // Suggestion table
  suggestions: defineTable({
    documentId: v.id("documents"), // reference to documents table
    documentCreatedAt: v.number(), // timestamp as number
    originalText: v.string(),
    suggestedText: v.string(),
    description: v.optional(v.string()),
    isResolved: v.boolean(),
    userId: v.id("users"), // reference to users table
    createdAt: v.number(), // timestamp as number
    updatedAt: v.optional(v.number()), // timestamp as number
  }).index("by_document", ["documentId"])
    .index("by_user", ["userId"]),

  // Stream table
  streams: defineTable({
    chatId: v.id("chats"), // reference to chats table
    createdAt: v.number(), // timestamp as number
    status: v.optional(v.string()), // "active", "completed", "error"
    content: v.optional(v.string()),
  }).index("by_chat", ["chatId"]),

  // MessageJwt table (if needed for specific integrations)
  messageJwt: defineTable({
    chatId: v.id("chats"), // reference to chats table
    messageId: v.id("messages"), // reference to messages table
    jwt: v.string(),
    createdAt: v.number(), // timestamp as number
  }).index("by_message", ["messageId"]),
});
