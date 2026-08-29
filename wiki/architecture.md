# Architecture

> Last updated: 2026-08-29

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2.10 | App Router, React Server Components |
| UI Library | React | 19.2.4 | Concurrent features, Server Components |
| Runtime | Bun | ≥ 1.2.3 | Package manager + script runner |
| CSS | Tailwind CSS | v4 | `@tailwindcss/postcss`, `@theme inline` syntax |
| Component System | shadcn/ui (Base UI) | `@shadcn/react` 0.2.1 + `@base-ui/react` 1.6.0 | See [UI & Design System](ui-and-design-system.md) |
| Authentication | Clerk | `@clerk/nextjs` 7.5.20 | See [Auth](auth.md) |
| ORM | Prisma | 7.8.0 | Driver-based adapter (`@prisma/adapter-pg`) |
| Database | PostgreSQL | Neon serverless | Connection pooling via Neon pooler |
| State / Cache | TanStack Query | 5.x | See [Features & State](features-and-state.md) |
| AI | Vercel AI SDK + OpenAI | `ai` 7.0.46, `@ai-sdk/openai` 4.0.26 | See [AI System](ai-system.md) |
| Icons | Phosphor Icons | `@phosphor-icons/react` 2.1.10 | `*Icon` suffix convention |

## Directory Layout

```
.
├── app/
│   ├── (auth)/              # Clerk sign-in page
│   │   └── sign-in/
│   ├── (root)/              # Authenticated shell (protected by auth.protect())
│   │   ├── layout.tsx       # Calls auth.protect() + onBoard() → wraps in ChatShell
│   │   ├── page.tsx         # Creates a new conversation → redirects to /c/[id]
│   │   └── c/[id]/
│   │       └── page.tsx     # Single conversation view
│   ├── layout.tsx           # Root layout: fonts, ClerkProvider, QueryProvider, ThemeProvider
│   ├── globals.css          # Tailwind v4 imports, design tokens, dark mode
│   └── favicon.ico
├── features/                # Feature-sliced architecture
│   ├── ai/                  # AI model configuration
│   │   └── config/model.ts  # getModel() helper, DEFAULT_MODEL
│   ├── auth/                # Authentication helpers
│   │   └── action/
│   │       ├── onboard.ts   # Clerk → Prisma user sync (upsert)
│   │       └── require-user.ts  # Auth guard for server actions
│   ├── conversation/        # Conversation feature slice
│   │   ├── actions/         # Server actions (CRUD)
│   │   ├── components/      # AppSidebar, ChatShell
│   │   └── hooks/           # TanStack Query hooks
│   ├── home/                # Home page logic
│   │   └── actions/start-new-chat.ts
│   ├── messages/            # Message feature slice
│   │   ├── actions/         # Server actions (CRUD)
│   │   └── hooks/           # TanStack Query hooks
│   └── utils/
│       └── query-keys.ts    # Centralized TanStack Query key factory
├── components/
│   ├── ui/                  # shadcn/ui primitives (sidebar, dropdown, skeleton, etc.)
│   └── providers/           # ThemeProvider, QueryProvider
├── lib/
│   ├── db.ts                # Prisma client singleton (PrismaPg adapter)
│   ├── utils.ts             # cn() classname helper
│   └── generated/prisma/    # Prisma generated client (gitignored)
├── prisma/
│   ├── schema.prisma        # Database models
│   └── migrations/
├── wiki/                    # LLM Wiki (this knowledge base)
├── proxy.ts                 # Clerk middleware (clerkMiddleware)
├── env.ts                   # Zod-validated environment variables
├── package.json
├── AGENTS.md                # Agent instructions (wiki protocol)
├── CLAUDE.md                # Points to AGENTS.md
└── openmemory.md            # OpenMemory project guide
```

## Request Lifecycle

### Server-Side (RSC)

1. **Middleware** (`proxy.ts`): `clerkMiddleware()` runs on every matched route, attaches auth context.
2. **Root Layout** (`app/(root)/layout.tsx`): `auth.protect()` gates access. `onBoard()` syncs Clerk user → Prisma `User` via upsert.
3. **Page Rendering**: Server Components fetch data directly via server actions (e.g. `getConversationById()`).
4. **Server Actions**: All mutations go through `"use server"` functions that call `requireUser()` first, then operate on Prisma.

### Client-Side

1. **TanStack Query**: Client components use hooks from `features/*/hooks/` that wrap server actions.
2. **Cache invalidation**: Mutations call `queryClient.invalidateQueries()` on related keys. Server actions also call `revalidatePath()` for RSC cache.
3. **Navigation**: `useRouter().push()` for client-side transitions. `redirect()` for server-side redirects.

## Key Patterns

- **Feature-sliced design**: Each domain (`conversation`, `messages`, `auth`, `home`, `ai`) is self-contained with its own `actions/`, `components/`, and `hooks/`.
- **Server action guard**: Every mutating server action starts with `requireUser()` → `assertConversation()` ownership check.
- **Dual cache invalidation**: Both RSC (`revalidatePath`) and TanStack Query (`invalidateQueries`) are invalidated on writes.
- **Singleton Prisma client**: `lib/db.ts` caches the client on `globalThis` in development to survive HMR.

---

See also: [Database](database.md) · [Auth](auth.md) · [Features & State](features-and-state.md) · [AI System](ai-system.md) · [UI & Design System](ui-and-design-system.md) · [Conventions & Gotchas](conventions-and-gotchas.md)
