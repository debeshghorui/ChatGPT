# Conventions & Gotchas

> Last updated: 2026-08-29

## ⚠️ Next.js 16 — Breaking Changes

> **This is NOT the Next.js you know.** APIs, conventions, and file structure may differ from training data. Always read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key areas where Next.js 16 may differ:
- Route handler patterns
- Server action conventions
- Middleware API
- Image component behavior
- Caching and revalidation semantics

**Mandatory:** Before implementing anything Next.js-specific, check `node_modules/next/dist/docs/01-app/` for the latest API reference.

## Prisma 7 — Driver-Based Adapter

Prisma 7+ no longer embeds the database URL in the generated client. You **must** create an adapter and pass it to the constructor:

```ts
// ✅ Correct (Prisma 7+)
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

// ❌ Wrong (Prisma 5/6 pattern)
const prisma = new PrismaClient();  // No connection without adapter
```

Generated client output is at `lib/generated/prisma/` (not the default `node_modules/.prisma/client`).

## Bun Runtime

The project uses **Bun** (≥ 1.2.3) as both package manager and script runner.

```bash
bun run dev           # Start dev server
bun run build         # Production build
bun run db:migrate    # Prisma migrate dev
bun run db:generate   # Prisma generate
bun run db:studio     # Prisma Studio
bun run format        # Prettier
bun run lint          # ESLint
```

> `bun --bun run prisma ...` is used for Prisma commands to ensure Bun's native runtime is used.

## Environment Validation

**File:** [`env.ts`](../env.ts)

All environment variables are validated at startup using **Zod v4**:

```ts
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().url().startsWith("postgresql://"),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith("pk_test_"),
    CLERK_SECRET_KEY: z.string().startsWith("sk_test_"),
    OPENAI_MODEL: z.string().default("gpt-4o-mini"),
    OPENAI_API_KEY: z.string().startsWith("sk_"),
});
```

If validation fails, the app throws with a formatted error message. Import `env` from `@/env` — never use `process.env` directly.

## Code Style

### Formatter & Linter

- **Prettier** 3.9.5 with `prettier-plugin-tailwindcss`
- **ESLint** 9 with flat config (`eslint.config.mjs`), `eslint-config-next`, `eslint-config-prettier`, `@tanstack/eslint-plugin-query`
- **Husky** + **lint-staged**: pre-commit hook runs Prettier + ESLint on staged files

### Icon Convention

> **Rule:** Use `@phosphor-icons/react` with `*Icon` suffix. Never use `lucide-react` in app/feature code.

### Server Action Pattern

```ts
"use server";

export async function myAction(arg: string) {
    const user = await requireUser();           // 1. Auth guard
    await assertConversation(id, user.id);      // 2. Ownership check
    // ... business logic ...
    revalidatePath("/");                        // 3. RSC cache invalidation
    return result;
}
```

### TanStack Query Hook Pattern

```ts
"use client";

export function useMyQuery(id: string) {
    return useQuery({
        queryKey: queryKeys.myResource.detail(id),
        queryFn: () => myServerAction(id),
        enabled: Boolean(id),
    });
}

export function useMyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => myServerAction(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.myResource.all,
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Fallback message");
        },
    });
}
```

## Known Issues / Technical Debt

- **Typo in `updateConversation` params:** The function accepts `{ titel?, isPinned?, isArchive? }` — `titel` should be `title`, `isArchive` should be `isArchived`. These are not yet fixed.
- **`assertConversation` duplication:** The ownership check function is duplicated in both `conversations-actions.ts` and `messages-action.ts`.
- **Chat page variable scoping bug:** In `app/(root)/c/[id]/page.tsx`, `conversation` is used in the JSX return but is only defined inside the `try` block — this will cause a compile error. The page needs restructuring.
- **No AI streaming endpoint:** The model config is ready but no streaming chat route or server action exists yet.
- **Missing `OPENAI_API_KEY` in `.env`:** The env file has no `OPENAI_API_KEY` entry, but `env.ts` requires one starting with `sk_`.

## Files Not to Commit

Per `.gitignore`:
- `.env*` — all environment files
- `lib/generated/prisma/` — Prisma generated client
- `.cursor/rules/openmemory.mdc` — IDE-specific rules
- `CLAUDE.md`, `AGENTS.md` — agent configuration (gitignored, IDE-local)

---

See also: [Architecture](architecture.md) · [Database](database.md) · [UI & Design System](ui-and-design-system.md)
