"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [authChanged, setAuthChanged] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Set up authentication with Convex
  useEffect(() => {
    // Only proceed if Clerk auth is fully loaded
    if (!isAuthLoaded) return;
    
    // Function to update the Convex client with the Clerk token
    const updateConvexAuth = async () => {
      try {
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
      } catch (error) {
        console.error("Error setting Convex auth:", error);
      } finally {
        setAuthChanged(true);
        setIsInitializing(false);
      }
    };

    // Update auth when the auth state changes
    updateConvexAuth();
  }, [getToken, isSignedIn, isAuthLoaded]);
  
  // Force a refresh of the page when auth state changes
  useEffect(() => {
    if (isAuthLoaded && isUserLoaded && !isInitializing && authChanged) {
      // Use router.refresh() to ensure the page re-renders with the new auth state
      router.refresh();
    }
  }, [isAuthLoaded, isUserLoaded, isInitializing, authChanged, router]);

  // Show loading state while initializing auth
  if (isInitializing || (!authChanged && isSignedIn)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-sm text-gray-500">Loading your session...</p>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
};
