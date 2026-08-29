# OpenMemory Guide — ChatGPT (ChaiGPT)

## Overview
Next.js 16 chat app (Bun) with Clerk auth, Prisma/Postgres, TanStack Query, and shadcn/ui (Base UI). Feature-sliced under `features/`.

> **Note:** The complete, compounding repository knowledge base is maintained in `wiki/`. See `wiki/index.md` for full documentation and index.

## Architecture
- `app/(root)` — authenticated shell: home `/`, conversation `/c/[id]`
- `app/(auth)` — Clerk sign-in
- `features/conversation` — sidebar, chat shell, conversation actions/hooks
- `features/messages` — message actions/hooks
- `features/home` — start-new-chat action
- `features/auth` — require-user / onboard
- `components/ui` — shadcn primitives
- `wiki/` — Repository LLM Wiki (architecture, database, auth, features, UI, conventions, log)

## User Defined Namespaces
- [Leave blank - user populates]

## Components
- **AppSidebar** (`features/conversation/components/app-sidebar.tsx`) — logo, new chat, conversation list (rename/pin/delete), theme toggle, Clerk account
- **ChatShell** (`features/conversation/components/chat-shell.tsx`) — conversation page shell

## Patterns
- **LLM Wiki Protocol:** Read `wiki/index.md` before starting tasks. Keep wiki updated as code evolves.
- **Icons:** `@phosphor-icons/react` with `*Icon` suffix (e.g. `PlusIcon`, `DotsThreeIcon`). Do not use `lucide-react` in app feature code.
- **UI primitives:** Already use Phosphor (sidebar, dropdown, dialog, etc.).
- **Server actions + TanStack Query:** Dual cache invalidation on mutations (`revalidatePath` + `invalidateQueries`).
