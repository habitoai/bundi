"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { useAuth } from "@clerk/nextjs";

// Initialize the Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

export interface ConvexClientProviderProps {
  children: ReactNode;
}

/**
 * Provider component that integrates Convex with Clerk for authentication.
 * This component should wrap your application to enable authenticated
 * Convex queries and mutations.
 */
export const ConvexClientProvider = ({
  children,
}: ConvexClientProviderProps) => {
  const { getToken, isSignedIn } = useAuth();
  const [authChanged, setAuthChanged] = useState(false);

  // Set up authentication with Convex
  useEffect(() => {
    // Function to update the Convex client with the Clerk token
    const updateConvexAuth = async () => {
      if (isSignedIn) {
        // Get the JWT from Clerk
        const token = await getToken({ template: "convex" });
        // Set the auth token in the Convex client
        if (token) {
          // Use a function that returns the token to satisfy TypeScript
          convex.setAuth(() => token);
        }
      } else {
        // Clear the auth token when signed out
        convex.clearAuth();
      }
      setAuthChanged(true);
    };

    // Update auth when the auth state changes
    updateConvexAuth();
  }, [getToken, isSignedIn]);

  // Only render children once we've set the initial auth state
  if (!authChanged && isSignedIn) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
};
