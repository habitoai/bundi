import { v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation, query } from "./_generated/server";
import { getUserByClerkId } from "./utils";

// Define a custom error class
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Clerk authentication configuration for Convex.
 * 
 * This file sets up the integration between Clerk and Convex,
 * allowing Convex to authenticate users based on Clerk's JWT tokens.
 */

// Define the auth configuration for Convex
export default {
  // Define how Convex should verify the identity token
  providers: [
    {
      // Use the 'clerk.dev' domain for authentication
      domain: "clerk.dev",
      applicationID: "clerk",
    },
  ],
};

/**
 * Get the currently authenticated user from the Convex database.
 * 
 * This function is used to retrieve the user document associated with 
 * the authenticated Clerk user.
 */
export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }
    
    // The token identifier is the Clerk user ID
    const clerkId = identity.tokenIdentifier;
    
    // Get the user from the database
    const user = await getUserByClerkId(ctx, clerkId);
    return user;
  },
});

/**
 * Utility function to get the authenticated user in a mutation context
 * and throw an error if the user is not authenticated.
 */
export async function getAuthenticatedUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new AuthError("Not authenticated");
  }
  
  // The token identifier is the Clerk user ID
  const clerkId = identity.tokenIdentifier;
  
  // Get the user from the database
  const user = await getUserByClerkId(ctx, clerkId);
  
  if (!user) {
    throw new AuthError("User not found");
  }
  
  return user;
}
