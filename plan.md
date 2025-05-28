# Plan: Migrating Bundi to Clerk (Auth) and Convex (Database)

This document outlines the step-by-step plan to migrate the Bundi application from its current NextAuth.js (authentication) and PostgreSQL/Drizzle (database schema) stack to Clerk (for authentication) and Convex (for the database). Since there is no existing data in the PostgreSQL database, this plan focuses on schema translation, new user creation via Clerk, and building application logic on Convex.

## Phase 1: Initial Setup (Clerk & Convex Projects)

1.  **Review Existing PostgreSQL Schema:** ✅ Carefully review your current PostgreSQL schema defined with Drizzle in `lib/db/schema.ts` to understand all table structures and relationships.
2.  **Set up Clerk Application:** ✅
    *   ✅ Sign up for a Clerk account and create a new application in the Clerk dashboard.
    *   ✅ Securely store your Clerk API keys (Frontend, Backend) and note the JWKS endpoint URL.
    *   ✅ Configure essential Clerk settings: allowed origins, preferred sign-in/sign-up methods.
3.  **Set up Convex Project:** ✅
    *   ✅ If you haven't already, install the Convex CLI (`npm install -g convex`).
    *   ✅ Initialize a new Convex project within your Bundi application structure (`npx convex init`).
    *   ✅ Perform an initial deployment (`npx convex deploy`) to get your Convex project live.
4.  **Define Core Convex Schema (`convex/schema.ts`): ✅
    *   ✅ Translate your existing PostgreSQL schema (from `lib/db/schema.ts`) to Convex's schema definition format (using `defineSchema`, `defineTable`, `v.id()`, `v.string()`, etc.).
    *   ✅ Key tables to redefine in Convex: `users`, `chats`, `messages`, `documents`, `suggestions` (and `streams` if still needed).
    *   ✅ In the `users` table schema in Convex, ensure you include a field like `clerkId: v.string()` and define an index for it (e.g., `.index("by_clerk_id", ["clerkId"])`).
 This field will be populated for all new users created via Clerk.
    *   ✅ Define other necessary indexes on your Convex tables based on common query patterns (e.g., `by_user_id` for chats, `by_chat_id` for messages).
    *   ✅ Deploy your initial Convex schema (`npx convex deploy`).

## Phase 2: Clerk Integration with Convex Backend

1.  **Install Clerk Next.js SDK:** ✅ Add `@clerk/nextjs` to your Next.js project.
2.  **Configure Environment Variables:** ✅ Add Clerk API keys and redirect URLs to `.env.local`. Add your Convex deployment URL (`NEXT_PUBLIC_CONVEX_URL`).
3.  **Wrap App with `ClerkProvider` and `ConvexProvider`:** ✅ Update `app/layout.tsx` to include both providers. If using Convex's built-in auth integration with Clerk, ensure `ConvexProvider` is configured to use the Clerk token.
4.  **Create Clerk Middleware (`middleware.ts`):** ✅ Implement `authMiddleware` from `@clerk/nextjs` to protect routes. Define public routes (e.g., `/`, `/sign-in`, `/sign-up`, and your Clerk webhook endpoint).
5.  **Implement Clerk Webhooks for User Synchronization with Convex:** ✅
    *   ✅ Create a Next.js API route (e.g., `app/api/webhooks/clerk/route.ts`) to handle Clerk webhooks.
    *   ✅ Define Convex mutations/actions (e.g., in `convex/users.ts` or a dedicated `convex/clerkSync.ts`) for:
        *   ✅ **`handleUserCreatedOrUpdated` (or similar):** This Convex function will be called by your webhook handler. It receives Clerk user data (`clerkId`, `email_addresses`, `first_name`, `last_name`, `image_url`, etc.).
            *   ✅ It should first try to find an existing user in Convex by `clerkId`. If found, update their details.
            *   ✅ If no user is found by `clerkId` (which will be the case for a brand new user signing up), insert a new user document into Convex with the `clerkId` and other details from Clerk.
        *   ✅ **`handleUserDeleted` (or similar):** This Convex function will delete the user from Convex based on their `clerkId`.
    *   ✅ Your Next.js webhook endpoint will verify the webhook signature and then call these Convex functions using the Convex server client, passing the necessary data from the webhook payload.
6.  **Configure Webhook in Clerk Dashboard:** ✅ Set up a webhook endpoint in Clerk pointing to your Next.js API route. Subscribe to `user.created`, `user.updated`, and `user.deleted` events. Secure it with the signing secret.

## Phase 3: Application Logic Migration (Drizzle/PostgreSQL to Convex)

1.  **Identify All Database Interaction Logic:** Review your current codebase, especially `lib/db/queries.ts` and any server-side logic or API routes that would have used Drizzle to interact with PostgreSQL.
2.  **Implement Database Operations as Convex Functions:**
    *   For each intended database operation (based on your old `lib/db/queries.ts` and application needs), write an equivalent Convex query, mutation, or action in your `convex/` directory (e.g., in files like `convex/chats.ts`, `convex/messages.ts`, `convex/documents.ts`).
    *   Design your Convex functions according to Convex's data access patterns and capabilities (e.g., using indexes, handling relationships).
3.  **Update Application Code to Use Convex:**
    *   In your Next.js components (client and server), write logic to call your new Convex functions. Use `useQuery`, `useMutation`, `useAction` from `convex/react` in client components, and the Convex server client for server-side logic (e.g., in Route Handlers, Server Actions if applicable, or your AI tools backend).
    *   This involves building out the data interaction layer of your application on Convex.
4.  **Adapt AI Tools and Artifact Handling:** The logic in `lib/ai/tools/*` and `lib/artifacts/server.ts` will need to be implemented to call your new Convex mutations/actions for creating, updating, and retrieving documents and suggestions.

## Phase 4: UI for Authentication and Homepage (Using Clerk)

1.  **Create Sign-In and Sign-Up Pages:** ✅ Implement pages like `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` using Clerk's pre-built `<SignIn />` and `<SignUp />` components.
2.  **Develop Homepage (`app/page.tsx`):** ✅ Create a homepage that conditionally renders content based on the user's Clerk authentication state. Show sign-in/sign-up links for unauthenticated users, and a link to `/chat` and user information (e.g., via `<UserButton />`) for authenticated users.
3.  **User Management UI:** ✅ Utilize `<UserButton />` from `@clerk/nextjs` for easy profile management and sign-out.

## Phase 5: Testing, Deployment, and Cleanup

1.  **Thorough Testing (Staging & Production):**
    *   Test new user sign-up and sign-in (user created in Clerk and synced to Convex).
    *   Verify all application features that depend on database operations are working correctly with Convex (chat, document creation/editing, suggestions, etc.).
    *   Test webhook synchronization thoroughly (e.g., email changes in Clerk dashboard, user deletion from Clerk).
    *   Test route protection and public accessibility.
2.  **Deployment:** Deploy your Next.js application and your Convex backend updates.
3.  **Monitor:** Closely monitor the application and Convex logs post-deployment for any issues.
4.  **Deprecate and Remove Old Code/Infrastructure:**
    *   Once fully confident in the new Clerk + Convex system, begin removing the old NextAuth.js configurations and related code.
    *   Remove the entire `lib/db` directory (Drizzle schema, queries for PostgreSQL).
    *   Remove PostgreSQL dependencies from `package.json`.
    *   Ensure any local PostgreSQL development instances are no longer needed.

## Important Considerations:

*   **Schema Design:** Pay close attention to designing your Convex schema effectively, as this is the foundation of your new backend.
*   **Convex Functions:** Writing efficient and secure Convex queries, mutations, and actions is key.
*   **Rollback Plan:** While data migration is not an issue, have a plan if major issues arise with the Clerk or Convex integration (e.g., reverting to a previous commit).
*   **User Experience:** Ensure a smooth sign-up and login experience for new users.
