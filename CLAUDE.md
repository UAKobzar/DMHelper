# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Install all dependencies
pnpm install

# Development (server :3001 + client :5173 concurrently)
pnpm dev

# Build production
pnpm build

# Server tests
pnpm --filter server test              # Run all tests
pnpm --filter server test -- <pattern> # Run specific test pattern
pnpm --filter server test:coverage     # Coverage report

# Build shared types only (required before server/client builds)
pnpm --filter shared build
```

## Monorepo Structure & Architecture

This is a **pnpm workspace monorepo** with three main packages:

```
packages/shared/          → TypeScript interfaces (Mode, ChatMessage, Settings, etc.)
app/server/               → Fastify API server (port 3001)
app/client/               → React 18 + Vite app (port 5173)
modes/, data/             → User-created `.md` files (modes have YAML frontmatter)
```

**Dependency graph**: Client & Server both import from `@dmhelper/shared`. Shared has no dependencies on app packages.

## Server Architecture (Fastify)

**Entry point**: `app/server/src/index.ts`
- Registers Fastify plugins: CORS, Swagger (OpenAPI), Swagger UI
- Loads modes and data files from disk on startup
- Registers all routes (modes, data, chat, settings)

**Service layer** (`app/server/src/services/`):
- **modeService**: Reads `/modes/*.md`, parses with gray-matter (YAML frontmatter + body), caches in Map
- **dataService**: Reads `/data/*.md` content on demand, caches file list
- **chatService**: Orchestrates chat flow: (1) Load mode system prompt, (2) Append selected context files, (3) Call LLM provider

**Routes** (`app/server/src/routes/`):
- All routes define **JSON Schema** in `schema` object for both validation + OpenAPI auto-generation
- `GET /api/modes` → List all modes
- `GET /api/data` → List all data files
- `POST /api/chat` → Send message (returns full LLM response, not streamed)
- `GET|PUT /api/settings` → Get/update runtime provider settings
- OpenAPI spec at `/api/docs/json`, UI at `/api/docs`

**LLM providers** (`app/server/src/llm/`):
- **factory.ts**: `createProvider(name, model, config)` → returns LLMProvider instance
- Four implementations: **anthropic.ts**, **openai.ts**, **ollama.ts**, **llamacpp.ts**
- All implement `async complete(request: LLMRequest): Promise<LLMResponse>`
- Provider selection: env vars default, overridable at runtime via settings

**In-memory state** (`app/server/src/state.ts`):
- Single `state` object holds current LLM settings (provider, model, serverUrl)
- Resets on server restart
- Updated via `PUT /api/settings`

**Configuration** (`app/server/src/config.ts`):
- Loads from `.env` with `dotenv`
- Resolves `/modes` and `/data` relative to project root
- Config exported as typed object (not scattered across files)

## Client Architecture (React + Zustand)

**Store** (`app/client/src/store/appStore.ts`):
- Single Zustand store manages all state: messages, modes, dataFiles, activeModeId, selectedFileIds, settings
- Key actions: `loadModes()`, `loadDataFiles()`, `loadSettings()`, `sendMessage(content)`, `updateSettings()`
- `sendMessage`: Appends user message → POSTs to `/api/chat` with full history + mode + context files → appends assistant response
- No persistence (in-memory, resets on page refresh)

**API client** (`app/client/src/api/client.ts`):
- Typed fetch wrappers for all endpoints
- Single source of truth for API contract (mirrors server routes)
- Used by store actions

**Component structure**:
- **Chat/** (MessageList, MessageBubble, ChatInput, ChatPage) — message display + input
- **Sidebar/** (Sidebar, ModeSelector, ContextFileList) — mode + context selection + "New Chat" button
- **Settings/** (SettingsForm, SettingsPanel) — modal to update provider/model/serverUrl at runtime
- **ui/** (Button, Input, Textarea, Checkbox, Label, Select) — reusable form/button components using Tailwind

**Entry** (`app/client/src/App.tsx`):
- Renders Sidebar + ChatPage + Settings modal overlay
- Calls `loadSettings()` on mount
- Passes error state + handlers

## Mode & Context Injection Flow

**Modes** (`.md` files in `/modes`):
```markdown
---
name: Dungeon Master
description: Narrate the world as a DM
---

You are an experienced DM...
```
- Parsed with gray-matter: `data.name`, `data.description`, `content` = system prompt
- Loaded on server startup, cached in modeService

**Chat flow**:
1. Client selects mode + context files in sidebar
2. User sends message via ChatInput
3. Client POSTs to `/api/chat`: `{ messages: [...], modeId, contextFileIds, settings? }`
4. Server chatService:
   - Gets mode system prompt from modeService
   - Gets content of selected data files
   - Builds system prompt: `mode_prompt + "\n\n# World Context\n\n" + context_files`
   - Prepends as first user message to message array
   - Calls LLM provider with assembled messages
5. Server returns `{ content: string, provider, model }`
6. Client appends assistant message to store, re-renders

## Testing Strategy

**Test setup**: Vitest with `@vitest/coverage-v8`

**Route tests** (`__tests__/routes/`):
- Use Fastify `inject()` to test HTTP without spinning up a real server
- Mock services via `vi.mock()`
- Test happy path + error cases (e.g., 404 for missing file)

**Service tests** (`__tests__/services/`):
- Mock `fs/promises` to provide virtual `.md` files
- Test business logic: mode parsing, data loading, prompt assembly

**Pattern**: Tests import real service functions, mock their dependencies, call functions directly

## Important Details & Gotchas

**Lock files**: `pnpm-lock.yaml` is committed. Do not delete.

**Shared types build**: Must run `pnpm --filter shared build` before `pnpm dev` or `pnpm --filter server build`. This generates `packages/shared/dist/` which server & client import from.

**Import paths**: Server/client import shared types as `@dmhelper/shared` (via tsconfig paths), not relative paths.

**OpenAPI schemas**: Every route must define request/response JSON Schema in the `schema` object. This serves dual purpose: request validation + OpenAPI generation. Add/modify routes by editing the schema alongside the handler.

**Chat messages are full history**: Each `/api/chat` POST includes the entire message history from client store. Server does not persist messages—client owns that. This keeps server stateless.

**No streaming**: All LLM requests use `stream: false`. Server waits for full response before returning.

**Vite dev proxy**: Client dev server proxies `/api/*` to `http://localhost:3001`, so no CORS issues during development.

**Environment fallbacks**: `.env.example` is tracked in git; users copy to `.env` and fill in API keys. Server config has sensible defaults for local dev (e.g., `OLLAMA_URL=http://localhost:11434`).

## File Modifications Checklist

When adding features:

- **New route?** Create in `app/server/src/routes/`, add JSON schema, register in `index.ts`, add route + service tests
- **New service?** Create in `app/server/src/services/`, add unit tests with mocked fs
- **New client component?** Create in `app/client/src/components/{Feature}/`, use Zustand store via hooks
- **New shared type?** Add to `packages/shared/src/index.ts`, rebuild with `pnpm --filter shared build`
- **New endpoint?** Implement in server route, test with inject(), update client's `api/client.ts` wrapper
- **UI components?** Colocate in component directory (don't add to ui/ unless reusable across multiple features)

## Development Workflow

1. Start dev servers: `pnpm dev` (concurrent on ports 3001 + 5173)
2. Make changes (hot reload on both)
3. Run server tests: `pnpm --filter server test -- --watch`
4. Open `http://localhost:3001/api/docs` to test endpoints visually (Swagger UI)
5. Open `http://localhost:5173` to test UI
6. Before commit: `pnpm --filter server test` (ensure all pass)
