<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repository LLM Wiki Protocol

This codebase maintains a persistent **LLM Wiki** in `wiki/` based on [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). The wiki is the authoritative, compounding knowledge base of the codebase.

## 🚨 Mandatory Agent Rules

### 1. Read Index First
Before starting ANY research or code modification, read `wiki/index.md` to discover relevant architecture, database models, conventions, and existing patterns.

### 2. Follow Wiki Conventions
- **Icons:** Strict convention — use `@phosphor-icons/react` with the `*Icon` suffix (e.g. `PlusIcon`, `TrashIcon`). Never use `lucide-react`.
- **Database:** Prisma 7+ requires driver adapter `@prisma/adapter-pg` in `lib/db.ts`. Generated client is at `lib/generated/prisma`.
- **Auth Guard:** All mutating server actions must call `requireUser()` and assert conversation ownership.
- **Environment:** Always import validated `env` from `@/env`. Never access raw `process.env`.
- **Cache Invalidation:** Dual invalidation — call `queryClient.invalidateQueries()` on client and `revalidatePath()` in server actions.

### 3. Maintain the Wiki
The LLM owns and maintains the wiki:
- **When adding or modifying models/schema:** Update `wiki/database.md`.
- **When creating or altering feature slices/actions:** Update `wiki/features-and-state.md`.
- **When introducing architecture/tooling changes:** Update `wiki/architecture.md`.
- **When discovering gotchas/bugs:** Document in `wiki/conventions-and-gotchas.md`.
- **On every significant change:** Append an entry to `wiki/log.md` using the format:
  `## [YYYY-MM-DD] <action> | <summary>`
