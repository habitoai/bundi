import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./utils";

// Mutation to create a new user from Clerk webhook
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists (should ideally not happen if webhook is for new user)
    const existingUser = await getUserByClerkId(ctx, args.clerkId);
    if (existingUser) {
      console.warn(`User with Clerk ID ${args.clerkId} already exists. Skipping creation.`);
      return existingUser._id; // Or handle as an update if appropriate
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      image: args.imageUrl, // Ensure 'image' matches your schema field name for image URL
    });
    console.log(`Created new user in Convex: ${userId} for Clerk ID: ${args.clerkId}`);
    return userId;
  },
});

// Mutation to update an existing user from Clerk webhook
export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()), // Email might not always change or be present in every update
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);

    if (!user) {
      console.error(`User with Clerk ID ${args.clerkId} not found for update.`);
      // Optionally, you could create the user here if it's missing, 
      // though 'user.updated' should imply existence.
      // Or throw an error: throw new Error("User not found"); 
      return null;
    }

    await ctx.db.patch(user._id, {
      // Only update fields if they are provided in the webhook data
      ...(args.email && { email: args.email }),
      ...(args.name && { name: args.name }),
      ...(args.imageUrl && { image: args.imageUrl }), // Ensure 'image' matches schema
    });
    console.log(`Updated user in Convex: ${user._id} for Clerk ID: ${args.clerkId}`);
    return user._id;
  },
});

// Mutation to delete a user from Clerk webhook
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);

    if (!user) {
      console.warn(`User with Clerk ID ${args.clerkId} not found for deletion.`);
      return null;
    }

    // Before deleting the user, you might want to handle related data:
    // e.g., delete their chats, documents, etc., or anonymize them.
    // This depends on your application's data integrity and privacy requirements.
    // Example: const chats = await ctx.db.query('chats').withIndex('by_user', q => q.eq('userId', user._id)).collect();
    // for (const chat of chats) { await ctx.db.delete(chat._id); /* ...and messages */ }

    await ctx.db.delete(user._id);
    console.log(`Deleted user in Convex: ${user._id} for Clerk ID: ${args.clerkId}`);
    return user._id;
  },
});

// Note: The getUserByClerkId function is not defined here yet.
// We will create it in a `convex/utils.ts` file or similar.
// For now, these mutations assume its existence.
