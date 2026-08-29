# Repository LLM Wiki — Index

> **Agent Entry Point:** Read this index first to quickly locate relevant knowledge before starting any task on this codebase. Follow the links to drill into specific pages.

## Wiki Overview

This wiki is a structured, compounding knowledge base for AI coding agents and developers working on the **ChatGPT (ChaiGPT)** codebase. It captures architectural decisions, data models, conventions, and technical patterns so that context is never lost across sessions.

---

## 📚 Knowledge Catalog

### 1. System Architecture & Setup
- **[Architecture](architecture.md)** — High-level technology stack (Next.js 16.2, React 19, Bun, Prisma 7, Clerk, TanStack Query), directory layout (`app/`, `features/`, `components/`, `lib/`), RSC vs Client lifecycle, and key patterns.
- **[Conventions & Gotchas](conventions-and-gotchas.md)** — Crucial rules: Next.js 16 breaking change guides, Prisma 7 driver adapter, Bun commands, Zod environment validation (`env.ts`), coding standards, known bugs, and technical debt.

### 2. Data & Security
- **[Database](database.md)** — PostgreSQL (Neon), Prisma schema models (`User`, `Conversation`, `Message`), enums, composite indexes, cascades, client generation (`lib/generated/prisma`), and data access patterns.
- **[Authentication](auth.md)** — Clerk authentication flow, middleware matcher in `proxy.ts`, `onBoard()` user sync, `requireUser()` server action guard, and conversation ownership assertions.

### 3. Application Features & UI
- **[Features & State Management](features-and-state.md)** — Feature-sliced design (`features/conversation`, `features/messages`, `features/home`), server actions, TanStack Query cache key factory (`queryKeys`), and dual cache invalidation strategy.
- **[UI & Design System](ui-and-design-system.md)** — Tailwind CSS v4 (`@theme inline`, OKLCH palette), typography (`Roboto_Slab`, `Public_Sans`), `@phosphor-icons/react` naming convention (`*Icon` suffix), and `shadcn/ui` + Base UI component integration.

### 4. AI & LLM Engine
- **[AI System](ai-system.md)** — Vercel AI SDK (`ai` v7 + `@ai-sdk/openai`), `getModel()` configuration helper, default model resolution, message metadata schema, and upcoming streaming chat roadmap.

### 5. Activity & Change History
- **[Change Log](log.md)** — Chronological append-only record of repository changes, wiki ingests, architectural decisions, and agent operations.

---

## 🛠️ Agent Workflows

When working on this repository, every AI agent MUST follow these protocols:

1. **Query (Before Coding):**
   - Read this `wiki/index.md` to identify relevant pages.
   - Read the relevant page(s) (e.g. [Database](database.md) before writing queries, [Conventions & Gotchas](conventions-and-gotchas.md) before Next.js changes).

2. **Update (During / After Coding):**
   - If you modify or add database models, update [Database](database.md).
   - If you introduce or modify actions/hooks/features, update [Features & State Management](features-and-state.md).
   - If you introduce a new UI convention or dependency, update [UI & Design System](ui-and-design-system.md).
   - If you encounter a bug or new gotcha, document it in [Conventions & Gotchas](conventions-and-gotchas.md).

3. **Log (On Completion):**
   - Append an entry to [Change Log](log.md) in the standard format:
     `## [YYYY-MM-DD] <action> | <short description>`
