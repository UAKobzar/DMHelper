# D&D DM Helper

An AI-powered Dungeon Master assistant with LLM provider flexibility, world context injection, and interactive UI.

## Prerequisites

- **Node.js** (v18+)
- **pnpm** (v8+) — npm install -g pnpm

## Quick Start

```bash
# Install dependencies
pnpm install

# Build shared types
pnpm --filter shared build

# Copy and fill in environment variables
cp .env.example .env

# Start dev servers (server on :3001, client on :5173)
pnpm dev
```

## Project Structure

```
DMHelper/
├── modes/                  # DM mode definitions (YAML frontmatter + markdown)
│   ├── dungeon-master.md
│   └── narrator.md
├── data/                   # World context files
│   └── example-world.md
├── packages/shared/        # Shared TypeScript types
├── app/server/             # Fastify API server
├── app/client/             # React + Tailwind UI
└── pnpm-workspace.yaml     # Monorepo configuration
```

## Environment Configuration

Edit `.env` with your API keys:

```env
LLM_PROVIDER=anthropic              # anthropic | openai | ollama | llamacpp
LLM_MODEL=claude-opus-4-6
ANTHROPIC_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
OLLAMA_URL=http://localhost:11434   # Local Ollama server
LLAMACPP_URL=http://localhost:8080  # Local llama.cpp server
PORT=3001                           # Server port
```

## Running

### Development

```bash
pnpm dev
```

- **Server**: http://localhost:3001
  - API endpoints at `/api/*`
  - OpenAPI docs at `/api/docs`
- **Client**: http://localhost:5173

### Testing

```bash
# Run server tests
pnpm --filter server test

# Coverage report
pnpm --filter server test:coverage
```

### Production Build

```bash
pnpm build
```

## API Endpoints

All endpoints documented at http://localhost:3001/api/docs (Swagger UI)

| Method | Path | Description |
|---|---|---|
| GET | `/api/modes` | List all available DM modes |
| GET | `/api/data` | List world context files |
| GET | `/api/data/:filename` | Get markdown content of a file |
| POST | `/api/chat` | Send chat message (LLM response) |
| GET | `/api/settings` | Get current LLM settings |
| PUT | `/api/settings` | Update LLM settings |
| GET | `/api/docs` | Swagger UI |
| GET | `/api/docs/json` | OpenAPI 3.0 spec |

## Features

✅ Multiple LLM providers (Anthropic, OpenAI, Ollama, llama.cpp)
✅ Mode switching (DM, Narrator, etc.)
✅ Multi-select world context files
✅ In-memory chat history
✅ Real-time settings updates
✅ Markdown rendering in responses
✅ Auto-scrolling chat
✅ OpenAPI documentation
✅ Full test coverage (server)

## Configuration

### Adding Modes

Create `.md` files in `/modes` with YAML frontmatter:

```markdown
---
name: My Mode
description: What this mode does
---

System prompt content here...
```

### Adding Context Files

Create `.md` files in `/data`:

```markdown
# The Forbidden City

Description of locations, NPCs, plot hooks...
```

## Testing

### Server Tests

Vitest is configured for comprehensive testing:

- **Route tests** (`__tests__/routes/`) — Fastify inject() for HTTP testing
- **Service tests** (`__tests__/services/`) — Unit tests with mocked filesystem

```bash
pnpm --filter server test                  # Run all tests
pnpm --filter server test:coverage         # With coverage report
pnpm --filter server test -- --ui          # Interactive UI
```

## Troubleshooting

**Port already in use**
```bash
# Change PORT in .env
PORT=3002 pnpm dev
```

**API key not working**
- Verify key is set in `.env`
- Check provider URL is correct (for Ollama/llama.cpp)
- Check "Settings" panel in UI for runtime overrides

**Cannot find modes/data files**
- Ensure `/modes` and `/data` directories exist
- Files must end in `.md`

## Development

### Project Layout

- **Monorepo** using pnpm workspaces
- **Shared types** in `packages/shared` (imported as `@dmhelper/shared`)
- **Server** is Fastify with TypeScript, routes in `src/routes/`, services in `src/services/`
- **Client** is React 18 + Vite, Zustand store, Tailwind CSS

### Adding a New Route

1. Create handler in `app/server/src/routes/`
2. Define request/response JSON schema for OpenAPI
3. Register in `app/server/src/index.ts`
4. Add tests in `app/server/src/__tests__/routes/`

### Adding a New Component

Use `app/client/src/components/` directories per feature (Chat, Sidebar, Settings, etc.)

## License

MIT
