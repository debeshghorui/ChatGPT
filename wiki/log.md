# Wiki Activity Log

Chronological append-only record of major repository changes, knowledge ingestions, schema modifications, and agent operations.

Each entry follows the parseable format:
`## [YYYY-MM-DD] <action> | <summary>`

Supported actions: `init`, `ingest`, `feature`, `refactor`, `fix`, `schema`, `lint`

---

## [2026-08-29] init | Initialized repository LLM Wiki following Andrej Karpathy's pattern
- Created structured wiki in `wiki/` (`index.md`, `architecture.md`, `database.md`, `auth.md`, `features-and-state.md`, `ai-system.md`, `ui-and-design-system.md`, `conventions-and-gotchas.md`, `log.md`).
- Documented full tech stack: Next.js 16.2 (App Router), React 19, Bun >=1.2, Prisma 7.8 with Neon Postgres adapter, Clerk 7.5, TanStack Query 5, Tailwind CSS v4, shadcn/ui + Base UI, Phosphor Icons.
- Configured agent protocol in `AGENTS.md` and `CLAUDE.md` to maintain persistent context and prevent knowledge loss across sessions.
