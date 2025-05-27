import { QueryCtx } from "./_generated/server";

/**
 * Utility function to get a user by their Clerk ID.
 * This can be used by multiple mutations or queries.
 */
export const getUserByClerkId = async (ctx: QueryCtx, clerkId: string) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
};
