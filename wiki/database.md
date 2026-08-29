# Database

> Last updated: 2026-08-29

## Overview

PostgreSQL hosted on **Neon** (serverless, connection pooling). ORM is **Prisma 7.8** using the driver-based adapter pattern (`@prisma/adapter-pg`).

## Connection & Client

The Prisma client is instantiated in [`lib/db.ts`](../lib/db.ts):

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

**Key details:**
- Prisma 7+ requires an explicit adapter — the connection string is **not** baked into the generated client.
- Generated client output: `lib/generated/prisma/` (gitignored).
- Singleton pattern via `globalThis` to survive HMR in development.

## Schema

Source: [`prisma/schema.prisma`](../prisma/schema.prisma)

### Generator & Datasource

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

> Note: No `url` in `datasource` — the connection string is passed at runtime via the PG adapter.

### Models

#### User

| Field | Type | Attributes |
|-------|------|------------|
| id | String | `@id @default(cuid())` |
| clerkId | String | `@unique` |
| email | String? | `@unique` |
| password | String? | |
| firstName | String? | |
| lastName | String? | |
| imageUrl | String? | |
| isActive | Boolean | `@default(true)` |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

**Relations:** `conversations Conversation[]`

Synced from Clerk via [`onBoard()`](../features/auth/action/onboard.ts) using `prisma.user.upsert()` on the `clerkId`.

#### Conversation

| Field | Type | Attributes |
|-------|------|------------|
| id | String | `@id @default(cuid())` |
| userId | String | FK → User.id |
| title | String | `@default("New Chat")` |
| model | String? | `@default("gpt-4o")` |
| systemPrompt | String? | `@db.Text` |
| isPinned | Boolean | `@default(false)` |
| isArchived | Boolean | `@default(false)` |
| isDeleted | Boolean | `@default(false)` |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |
| lastMessageAt | DateTime? | `@default(now())` |

**Relations:** `user User`, `messages Message[]`

**Indexes:**
- `@@index([userId, lastMessageAt(sort: Desc)])` — list conversations by recent activity
- `@@index([userId, isPinned, lastMessageAt(sort: Desc)])` — pinned-first listing

**Cascade delete:** Deleting a User cascades to all their Conversations.

#### Message

| Field | Type | Attributes |
|-------|------|------------|
| id | String | `@id @default(cuid())` |
| conversationId | String | FK → Conversation.id |
| role | MessageRole | enum |
| status | MessageStatus | `@default(PENDING)` |
| content | String | `@db.Text` |
| parts | Json? | |
| metadata | Json? | |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

**Index:** `@@index([conversationId, createdAt(sort: Desc)])`

**Cascade delete:** Deleting a Conversation cascades to all its Messages.

### Enums

```prisma
enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
  TOOL
}

enum MessageStatus {
  PENDING
  COMPLETE
  ERROR
  CANCELLED
}
```

## Migration Commands

```bash
bun run db:migrate      # prisma migrate dev
bun run db:generate     # prisma generate
bun run db:studio       # prisma studio (GUI)
bun run prisma:format   # prisma format
```

## Data Access Patterns

- **Ownership check:** Every server action calls `requireUser()` then `assertConversation(conversationId, userId)` before operating.
- **Auto-rename:** When `createMessage()` is called on a conversation titled "New Chat", it renames the conversation to the first 48 chars of the message content.
- **Listing order:** Conversations are listed with `isPinned DESC, lastMessageAt DESC`. Messages are listed with `createdAt ASC`.

---

See also: [Architecture](architecture.md) · [Auth](auth.md) · [Features & State](features-and-state.md)
