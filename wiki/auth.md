# Authentication

> Last updated: 2026-08-29

## Overview

Authentication is handled by **Clerk** (`@clerk/nextjs` v7.5.20). The system uses a dual-identity model: Clerk manages external identity (OAuth, email/password), and the local Prisma `User` model stores application-specific data.

## Key Files

| File | Purpose |
|------|---------|
| [`proxy.ts`](../proxy.ts) | Clerk middleware — `clerkMiddleware()` on all matched routes |
| [`features/auth/action/onboard.ts`](../features/auth/action/onboard.ts) | Syncs Clerk user → Prisma User via `upsert` |
| [`features/auth/action/require-user.ts`](../features/auth/action/require-user.ts) | Auth guard for server actions |
| [`app/(root)/layout.tsx`](../app/(root)/layout.tsx) | Calls `auth.protect()` + `onBoard()` |
| [`app/(auth)/sign-in/`](../app/(auth)/sign-in/) | Clerk-hosted sign-in page |

## Middleware

`proxy.ts` exports `clerkMiddleware()` with a matcher that covers:
- All application routes (excluding static assets and Next.js internals)
- API routes (`/api/*`, `/trpc/*`)
- Clerk frontend API routes (`/__clerk/*`)

## Authentication Flow

```
User hits any route
  └→ proxy.ts: clerkMiddleware() attaches auth context
       └→ app/(root)/layout.tsx
            ├→ auth.protect()      — redirects to /sign-in if not authenticated
            └→ onBoard()           — upserts Clerk user into Prisma
                 └→ prisma.user.upsert({
                      where: { clerkId },
                      create: { clerkId, email, firstName, lastName, imageUrl },
                      update: { email, firstName, lastName, imageUrl }
                    })
```

## Server Action Guard: `requireUser()`

Every server action that touches user data calls this first:

```ts
export async function requireUser() {
    const { userId } = await auth.protect();    // Clerk session → clerkId
    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    });
    if (!user) throw new Error("Unauthorized");
    return user;                                 // Returns the Prisma User
}
```

Returns the **Prisma `User`** (not the Clerk user), so downstream code uses `user.id` (cuid) as the foreign key.

## Ownership Assertion

Most actions that operate on conversations also call `assertConversation()`:

```ts
async function assertConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: userId }
    });
    if (!conversation) throw new Error("Conversation not found or access denied");
    return conversation;
}
```

This pattern is duplicated in both `conversations-actions.ts` and `messages-action.ts`.

## Environment Variables

| Variable | Pattern | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_*` | Client-side Clerk key |
| `CLERK_SECRET_KEY` | `sk_test_*` | Server-side Clerk key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Sign-in route |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` | Post sign-in redirect |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` | Post sign-up redirect |

## UI Integration

- `<ClerkProvider>` wraps the entire app in `app/layout.tsx`.
- `<UserButton>` is rendered in the sidebar footer (`AppSidebar`) for account management.

---

See also: [Architecture](architecture.md) · [Database](database.md) · [Features & State](features-and-state.md)
