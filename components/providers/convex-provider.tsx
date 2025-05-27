"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Initialize the Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

export interface ConvexClerkProviderProps {
  children: ReactNode;
}

/**
 * Provider component that integrates Convex with Clerk for authentication.
 * This component should wrap your application to enable authenticated
 * Convex queries and mutations.
 */
export const ConvexClientProvider = ({
  children,
}: ConvexClerkProviderProps) => {
  return (
    <ConvexProviderWithClerk 
      client={convex} 
      useAuth={useAuth}
    >
      {children}
    </ConvexProviderWithClerk>
  );
};
