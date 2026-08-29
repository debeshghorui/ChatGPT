# AI System

> Last updated: 2026-08-29

## Overview

The AI layer uses the **Vercel AI SDK** (`ai` v7.0.46) with the **OpenAI provider** (`@ai-sdk/openai` v4.0.26). The system is currently in early development — model configuration is in place but the chat streaming endpoint is not yet fully wired.

## Model Configuration

**File:** [`features/ai/config/model.ts`](../features/ai/config/model.ts)

```ts
import { openai } from "@ai-sdk/openai";
import { env } from "@/env";

export const DEFAULT_MODEL = env.OPENAI_MODEL;

export function getModel(modelId?: string) {
    return openai(modelId || DEFAULT_MODEL);
}
```

- `DEFAULT_MODEL` is read from the `OPENAI_MODEL` environment variable (defaults to `"gpt-4o-mini"` via Zod).
- `getModel()` returns an AI SDK model instance. Accepts an optional override `modelId`.
- The `Conversation` model has a `model` field (defaults to `"gpt-4o"`) that can be used for per-conversation model selection.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_MODEL` | `gpt-4o-mini` | Default model for AI operations |
| `OPENAI_API_KEY` | — | OpenAI API key (validated: must start with `sk_`) |

## Database Integration

The `Conversation` model stores:
- `model` (`String?`, default `"gpt-4o"`) — the model to use for this conversation
- `systemPrompt` (`String?`, `@db.Text`) — optional system prompt override

The `Message` model stores:
- `role` — `USER | ASSISTANT | SYSTEM | TOOL`
- `status` — `PENDING | COMPLETE | ERROR | CANCELLED`
- `parts` (`Json?`) — for multi-part messages (tool calls, etc.)
- `metadata` (`Json?`) — for token usage, model info, etc.

## Current State & Roadmap

**Implemented:**
- ✅ Model configuration and provider setup
- ✅ Database schema for messages with role/status/parts/metadata
- ✅ User message creation and persistence

**Not yet implemented:**
- ⬜ Chat streaming endpoint (API route or server action using `streamText`)
- ⬜ Assistant message persistence after streaming
- ⬜ System prompt injection
- ⬜ Tool use / function calling
- ⬜ Model selector in the UI

## Vercel AI SDK Patterns

When implementing the chat endpoint, the expected pattern is:

```ts
import { streamText } from "ai";
import { getModel } from "@/features/ai/config/model";

// In a route handler or server action:
const result = streamText({
    model: getModel(conversation.model),
    system: conversation.systemPrompt,
    messages: formattedMessages,
});
```

---

See also: [Architecture](architecture.md) · [Features & State](features-and-state.md) · [Conventions & Gotchas](conventions-and-gotchas.md)
