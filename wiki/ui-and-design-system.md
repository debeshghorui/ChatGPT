# UI & Design System

> Last updated: 2026-08-29

## CSS Framework: Tailwind CSS v4

The project uses **Tailwind CSS v4** with the PostCSS plugin (`@tailwindcss/postcss`).

### Global Styles

**File:** [`app/globals.css`](../app/globals.css)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```

### Design Tokens

Tokens are defined using `@theme inline` (Tailwind v4 syntax) and CSS custom properties in `:root` / `.dark`:

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `oklch(1 0 0)` (white) | `oklch(0.148 0.004 228.8)` (near-black) |
| `--foreground` | `oklch(0.148 ...)` | `oklch(0.987 ...)` |
| `--primary` | `oklch(0.218 ...)` | `oklch(0.925 ...)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--radius` | `0.625rem` | `0.625rem` |

All color values use **OKLCH** color space.

### Radius Scale

Computed from `--radius` (0.625rem):
- `--radius-sm`: `0.375rem`
- `--radius-md`: `0.5rem`
- `--radius-lg`: `0.625rem` (base)
- `--radius-xl` through `--radius-4xl`: progressively larger

## Typography

**File:** [`app/layout.tsx`](../app/layout.tsx)

| Font | Variable | Usage |
|------|----------|-------|
| `Public_Sans` | `--font-heading` | Headings |
| `Roboto_Slab` | `--font-serif` | Body text (default via `font-serif` class on `<html>`) |
| `Geist` | `--font-geist-sans` | Sans-serif alternative |
| `Geist_Mono` | `--font-geist-mono` | Code / monospace |

The `<html>` element gets class `font-serif`, making `Roboto_Slab` the default body font.

## Icons: Phosphor Icons

**Package:** `@phosphor-icons/react` v2.1.10

### ⚠️ Strict Convention

> **Always** use `@phosphor-icons/react` with the `*Icon` suffix. **Never** use `lucide-react` in feature code.

Examples:
```tsx
import { PlusIcon, DotsThreeIcon, PencilSimpleIcon, TrashIcon, PushPinIcon } from "@phosphor-icons/react";
```

The shadcn/ui primitives in `components/ui/` already use Phosphor icons internally.

## Component System: shadcn/ui + Base UI

The project uses `@shadcn/react` (0.2.1) backed by `@base-ui/react` (1.6.0).

### Available Components (in `components/ui/`)

Core layout and navigation:
- `Sidebar`, `SidebarProvider`, `SidebarInset`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarRail`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger`
- `Button`
- `Skeleton`

### Render Pattern

shadcn/ui uses the `render` prop pattern for composition:

```tsx
<SidebarMenuButton render={<Link href="/" />}>
    <PlusIcon />
    <span>New chat</span>
</SidebarMenuButton>
```

## Theme System

**Provider:** `next-themes` (v0.4.6)

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
```

- Theme is toggled via `useTheme()` in the sidebar footer.
- Dark mode is class-based (`.dark` on `<html>`).
- `disableTransitionOnChange` prevents flash during theme switch.

## Provider Stack

Order in `app/layout.tsx` (outermost → innermost):
1. `<ClerkProvider>` — Authentication context
2. `<QueryProvider>` — TanStack Query client
3. `<ThemeProvider>` — Dark/light mode

## Utility: `cn()`

**File:** [`lib/utils.ts`](../lib/utils.ts)

Uses `clsx` + `tailwind-merge` for conditional classname merging:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

---

See also: [Architecture](architecture.md) · [Conventions & Gotchas](conventions-and-gotchas.md)
