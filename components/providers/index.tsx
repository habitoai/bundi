"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";
import { ConvexClientProvider } from "./convex-client";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Main providers component that wraps the application with all necessary providers.
 * This includes Clerk for authentication and Convex for data management.
 */
export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        {children}
      </ConvexClientProvider>
    </ClerkProvider>
  );
};
