# Features & State Management

> Last updated: 2026-08-29

## Feature-Sliced Architecture

The codebase follows a feature-sliced design under `features/`. Each slice owns its server actions, client hooks, and components. Shared UI primitives live in `components/ui/`.

## Query Keys

All TanStack Query keys are centralized in [`features/utils/query-keys.ts`](../features/utils/query-keys.ts):

```ts
export const queryKeys = {
    conversations: {
        all: ["conversations"] as const,
        detail: (id: string) => ["conversations", id] as const,
    },
    messages: {
        byConversationId: (conversationId: string) =>
            ["messages", conversationId] as const,
    },
};
```

---

## Feature: Conversation

**Location:** `features/conversation/`

### Server Actions (`actions/conversations-actions.ts`)

| Action | Description |
|--------|-------------|
| `listConversations()` | Lists non-archived conversations for the current user. Ordered: pinned DESC, lastMessageAt DESC |
| `getConversationById(id)` | Fetches a single conversation with ownership check |
| `createConversation(title?)` | Creates a new conversation (defaults to "New Chat") |
| `updateConversation(id, data)` | Updates title, isPinned, or isArchived. ⚠️ Note: param uses typo `titel` for title and `isArchive` for isArchived |
| `deleteConversation(id)` | Hard-deletes a conversation (cascades to messages) |

### Hooks (`hooks/use-conversation.ts`)

| Hook | Query Key | Description |
|------|-----------|-------------|
| `useConversations()` | `conversations.all` | Lists all conversations |
| `useCreateConversation()` | invalidates `conversations.all` | Creates + navigates to `/c/[id]` |
| `useUpdateConversation()` | invalidates `conversations.all` + `conversations.detail(id)` | Rename/pin/archive |
| `useDeleteConversation(activeId?)` | invalidates `conversations.all`, removes message cache | Deletes + redirects to `/` if active |

### Components

| Component | File | Description |
|-----------|------|-------------|
| `AppSidebar` | `components/app-sidebar.tsx` | Full sidebar: logo ("ChaiGPT"), new chat link, conversation list with rename/pin/delete context menu, theme toggle, Clerk `<UserButton>` |
| `ChatShell` | `components/chat-shell.tsx` | Wrapper: `<SidebarProvider>` + `<AppSidebar>` + `<SidebarInset>` |

**Sidebar conversation list behavior:**
- Active conversation ID is derived from `pathname.split("/")[2]`
- Context menu actions: Rename (via `window.prompt`), Pin/Unpin, Delete
- Loading state: 5 skeleton rows
- Empty state: "No chats yet" text

---

## Feature: Messages

**Location:** `features/messages/`

### Server Actions (`actions/messages-action.ts`)

| Action | Description |
|--------|-------------|
| `listMessages(conversationId)` | Lists messages oldest→newest for a conversation |
| `createMessage(conversationId, content)` | Creates a USER message. Auto-renames "New Chat" conversations to first 48 chars. Updates `lastMessageAt`. Revalidates `/` and `/c/[id]` |
| `updateMessage(messageId, content)` | Edits message text with ownership check |
| `deleteMessage(messageId)` | Deletes a single message with ownership check |

### Hooks (`hooks/use-messages.ts`)

| Hook | Query Key | Description |
|------|-----------|-------------|
| `useMessages(conversationId)` | `messages.byConversationId(id)` | Loads messages (enabled only when `conversationId` is set) |
| `useCreateMessage(conversationId)` | invalidates messages + conversations | Sends user message |
| `useUpdateMessage(conversationId)` | invalidates messages | Edits message |
| `useDeleteMessage(conversationId)` | invalidates messages | Deletes message + toast |

### Type: `MessageItem`

```ts
type MessageItem = {
    id: string;
    conversationId: string;
    role: MessageRole;       // USER | ASSISTANT | SYSTEM | TOOL
    status: MessageStatus;   // PENDING | COMPLETE | ERROR | CANCELLED
    content: string;
    createdAt: Date;
    updatedAt: Date;
};
```

---

## Feature: Home

**Location:** `features/home/`

### Server Actions (`actions/start-new-chat.ts`)

| Action | Description |
|--------|-------------|
| `startNewChat()` | Creates a "New Chat" conversation and returns its ID. Used by the root page to immediately redirect to `/c/[id]` |

---

## Feature: Auth

**Location:** `features/auth/`

See [Auth](auth.md) for full documentation.

---

## Feature: AI

**Location:** `features/ai/`

See [AI System](ai-system.md) for full documentation.

---

## Cache Invalidation Strategy

Writes use **dual invalidation**:
1. **RSC cache:** `revalidatePath("/")` and/or `revalidatePath("/c/[id]")` from server actions
2. **TanStack Query cache:** `queryClient.invalidateQueries()` from client hooks

This ensures both server-rendered pages and client-side query caches stay fresh.

---

See also: [Architecture](architecture.md) · [Database](database.md) · [AI System](ai-system.md)
