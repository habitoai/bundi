# Bundi Project: `lib` Directory Analysis

## Overview

The `lib` directory is a core part of the Bundi application, housing essential modules for AI functionalities, database interactions, document (artifact) management, editor functionalities, and various utilities. It provides the foundational logic upon which many of the application's features are built.

## Directory Structure

```
lib/
├── ai/                  # AI models, prompts, tools, and providers
│   ├── tools/             # Specific AI tools (create/update document, get weather, etc.)
│   ├── entitlements.ts    # User entitlements for AI features
│   ├── models.ts          # AI model definitions
│   ├── prompts.ts         # System and user prompts for AI
│   └── providers.ts       # AI service provider configurations
├── artifacts/           # Logic for handling different document types (artifacts)
│   └── server.ts          # Framework for document handlers (text, code, image, sheet)
├── db/                  # Database schema, queries, migrations, and helpers
│   ├── helpers/           # Helper scripts for DB tasks (e.g., data migration)
│   ├── migrations/        # Drizzle ORM migration files (SQL)
│   ├── migrate.ts         # Script to run database migrations
│   ├── queries.ts         # Database query functions (CRUD operations)
│   ├── schema.ts          # Database schema definition (Drizzle ORM)
│   └── utils.ts           # Database-specific utilities (e.g., password hashing)
├── editor/              # ProseMirror based rich text editor components
│   ├── config.ts          # ProseMirror schema and transaction configuration
│   ├── diff.js            # Document diffing logic
│   ├── functions.tsx      # Editor utility functions (Markdown conversion, decorations)
│   ├── react-renderer.tsx # Utility to render React components in ProseMirror
│   └── suggestions.tsx    # Suggestion display and interaction logic for the editor
├── constants.ts         # Global application constants
├── errors.ts            # Custom error handling classes and types
├── types.ts             # Global TypeScript type definitions
└── utils.ts             # General utility functions
```

## Key Components and Functionalities

### 1. Core Utilities (`constants.ts`, `errors.ts`, `types.ts`, `utils.ts`)

-   **`constants.ts`**: Defines global constants such as environment checks (`IS_TEST_ENV`, `IS_PREVIEW_ENV`), guest user identifiers (`GUEST_USER_ID`, `GUEST_EMAIL_PREFIX`), and a dummy password generator for guest accounts.
-   **`errors.ts`**: Implements a structured error handling system. It defines `ChatSDKError`, a custom error class that includes a `type` (e.g., `bad_request:validation`, `not_found:database`), `message`, and `visibility` (`public` or `private`). This allows for controlled error reporting to the user and detailed internal logging.
-   **`types.ts`**: Contains simple, shared TypeScript type definitions, such as `DataPart` used in streaming data for AI interactions.
-   **`utils.ts`**: Provides common utility functions like `cn` (for merging Tailwind CSS class names), `fetcher` (a wrapper around `fetch` with error handling and JSON parsing), and `generateUUID`.

### 2. AI Subsystem (`lib/ai/*`)

This subsystem manages all AI-related operations, including model definitions, prompts, interaction tools, and provider configurations.

-   **`ai/entitlements.ts`**: Defines user entitlements based on their type (guest or registered user). This includes limits on the number of messages they can send and which chat models they have access to.
-   **`ai/models.ts`**: Lists available AI chat models (e.g., GPT-3.5 Turbo, GPT-4) with their IDs, names, and descriptions. It also defines a `DEFAULT_CHAT_MODEL`.
-   **`ai/prompts.ts`**: Contains various system prompts used to guide the behavior of AI models. This includes prompts for generating different artifact kinds, code generation, adhering to user instructions, and providing helpful responses. Prompts like `SYSTEM_PROMPT_TEXT_COMPLETION` and `SYSTEM_PROMPT_CODE_COMPLETION` are tailored for specific tasks.
-   **`ai/providers.ts`**: Configures AI model providers (e.g., OpenAI). It allows the application to switch between different AI services or models, potentially based on the environment (test vs. production) using environment variables like `OPENAI_API_KEY` and `MOCK_PROVIDER`.

-   **`ai/tools/*`**: This directory contains the definitions for AI tools that the chat model can invoke. These tools are built using the Vercel AI SDK and Zod for input validation.
    -   **`create-document.ts`**: Defines the `createDocument` tool. The AI uses this to generate a new document (artifact) based on a user's description. It takes `title` and `kind` (text, code, etc.) as input. It streams the document creation process and content back to the UI using a `DataStreamWriter` and saves the final document to the database via `lib/artifacts/server.ts` handlers.
    -   **`get-weather.ts`**: Defines the `getWeather` tool. It takes `latitude` and `longitude` and returns the current weather for that location using an external weather API (`https://api.open-meteo.com`).
    -   **`request-suggestions.ts`**: Defines the `requestSuggestions` tool. The AI uses this to generate improvement suggestions for an existing document. It takes `documentId` and `documentContent` as input, generates suggestions (original text, suggested text, description), and saves them to the database.
    -   **`update-document.ts`**: Defines the `updateDocument` tool. The AI uses this to modify an existing document based on a user's description of the desired changes. It takes `documentId` and `description` as input, streams the update process, and saves the modified document via `lib/artifacts/server.ts` handlers.

### 3. Artifact Management (`lib/artifacts/server.ts`)

-   **Purpose**: Provides a framework for handling the creation and updating of different types of documents, referred to as "artifacts" (e.g., text, code, image, sheet).
-   **`DocumentHandler` Interface**: Defines a standard structure for artifact-specific handlers. Each handler must implement `onCreateDocument` and `onUpdateDocument` methods.
-   **`createDocumentHandler` Factory**: A function that creates `DocumentHandler` instances. It takes artifact-specific content generation/update logic as input and wraps it with common database saving logic (`saveDocument` from `lib/db/queries`).
-   **`documentHandlersByArtifactKind` Array**: An array that registers all available document handlers. The AI tools (`createDocument`, `updateDocument`) use this array to find the appropriate handler based on the artifact `kind`.
-   **Delegation**: The actual content generation/modification logic for each artifact type (e.g., how a 'text' document is created or how a 'code' document is updated) is delegated to modules outside the `lib` directory (e.g., `@/artifacts/text/server.ts`).

### 4. Database Subsystem (`lib/db/*`)

This subsystem is responsible for all database interactions, using Drizzle ORM with a PostgreSQL database.

-   **`db/schema.ts`**: Defines the database schema using Drizzle ORM. Key tables include:
    -   `user`: Stores user credentials and information.
    -   `chat`: Stores chat session metadata.
    -   `message` (and `messageDeprecated`): Stores individual chat messages, with `message` (v2) using a `parts` JSON field for structured content (Vercel AI SDK compliant).
    -   `vote` (and `voteDeprecated`): Stores user votes on messages.
    -   `document`: Stores artifacts created by users/AI, with fields for `title`, `content`, `kind`, and `userId`.
    -   `suggestion`: Stores AI-generated suggestions for documents.
    -   `stream`: Stores stream IDs for resumable chat interactions.
-   **`db/queries.ts`**: Contains a comprehensive set of asynchronous functions for CRUD operations on all tables defined in `schema.ts`. It handles user management, chat operations, message storage, document saving/retrieval, suggestion management, and stream ID handling. It uses `ChatSDKError` for error reporting.
-   **`db/migrate.ts`**: A script to run database migrations. It uses Drizzle ORM's migration capabilities to apply schema changes defined in the `migrations` folder.
-   **`db/migrations/*`**: Contains SQL files generated by Drizzle ORM, representing individual database schema migrations. Also includes a `meta` directory for migration journaling.
-   **`db/utils.ts`**: Provides database-specific utility functions, primarily `generateHashedPassword` (using `bcrypt-ts`) and `generateDummyPassword` for securing user passwords.
-   **`db/helpers/01-core-to-parts.ts`**: A data migration script used to transform data from the old `messageDeprecated` schema (with a single `content` field) to the new `message` schema (with a structured `parts` array), ensuring compatibility with the Vercel AI SDK's message format.

### 5. Editor Subsystem (`lib/editor/*`)

This subsystem implements a rich text editor using ProseMirror, including features for Markdown conversion, suggestions, and diffing.

-   **`editor/config.ts`**: Configures the ProseMirror editor. It defines the `documentSchema` (based on `prosemirror-schema-basic` and `prosemirror-schema-list`), input rules (e.g., for headings), and a `handleTransaction` function that manages editor state changes and triggers an `onSaveContent` callback (with debouncing options) when the document is modified.
-   **`editor/functions.tsx`**: Provides utility functions for the editor:
    -   `buildDocumentFromContent`: Converts a Markdown string to a ProseMirror document node (by first rendering Markdown to HTML, then parsing the HTML).
    -   `buildContentFromDocument`: Converts a ProseMirror document node back to a Markdown string.
    -   `createDecorations`: Creates ProseMirror decorations (inline highlights and widgets) to display suggestions within the editor.
-   **`editor/react-renderer.tsx`**: A utility class (`ReactRenderer`) to render React components into DOM elements, used for ProseMirror widgets that are React-based.
-   **`editor/suggestions.tsx`**: Manages the display and interaction of suggestions within the ProseMirror editor.
    -   Defines `UISuggestion` by adding editor-specific position information (`selectionStart`, `selectionEnd`) to database suggestions.
    -   `projectWithPositions`: Maps database suggestions to their positions in the current editor document.
    -   `createSuggestionWidget`: Creates the UI for a single suggestion (using a `PreviewSuggestion` React component) and handles the logic for applying a suggestion (replacing text and updating decorations).
    -   `suggestionsPlugin`: A ProseMirror plugin that manages the state and rendering of suggestion decorations.
-   **`editor/diff.js`**: Implements a document diffing algorithm, modified from `hamflx/prosemirror-diff`. It uses `diff-match-patch` for text diffing and provides functions to compare two ProseMirror documents, highlighting differences (insertions, deletions). It's capable of sentence-level diffing for text nodes.

## Interdependencies and Flow

-   **AI Tools & Artifacts**: AI tools in `lib/ai/tools` (like `createDocument`) call handlers defined via `lib/artifacts/server.ts` to perform actions. These handlers, in turn, might use AI prompts from `lib/ai/prompts.ts` and save data using `lib/db/queries.ts`.
-   **Editor & Suggestions**: The editor in `lib/editor` can display suggestions fetched from the database (via `lib/db/queries.ts`, potentially triggered by `lib/ai/tools/request-suggestions.ts`). Applying a suggestion updates the editor content, which then triggers a save (via `onSaveContent` in `editor/config.ts`), likely updating a document in the database.
-   **Database as Central Store**: The `lib/db` subsystem is central, storing user data, chat histories, documents, and suggestions, all ofwhich are accessed and manipulated by other `lib` components.
-   **Error Handling**: The custom `ChatSDKError` from `lib/errors.ts` is used throughout the `lib` directory, especially in database queries and AI tool execution, to provide consistent error information.

## Conclusion

The `lib` directory is a well-structured and comprehensive collection of modules that form the backbone of the Bundi application. It demonstrates a clear separation of concerns, with dedicated subsystems for AI, data persistence, artifact management, and rich text editing. The use of established libraries like Drizzle ORM, ProseMirror, and the Vercel AI SDK, combined with custom logic for error handling, prompts, and specific application features, creates a robust and extensible foundation. The presence of migration scripts and deprecated schema versions indicates an actively evolving codebase.
