# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: Batalha dos Encantados (Next.js app)

Tech stack
- Next.js (App Router) 15.x, React 19
- Tailwind CSS 4 (via postcss.config.mjs)
- ESLint (next/core-web-vitals)
- Data: Supabase (tables: players, collections, matches, decks), Vercel KV (ephemeral match state), Vercel Postgres client + drizzle-orm

Environment
Set these before running server-side APIs:
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key (browser client)
- SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (server routes)
- ADMIN_SEED_TOKEN: required to authorize POST /api/admin/seed in production; optional in dev
Optional:
- NEXT_PUBLIC_APP_VERSION: shows a version watermark in the UI (defaults to 0.1.0)
- NEXT_PUBLIC_API_URL: base for client API calls (defaults to /api)
- NEXT_PUBLIC_WS_URL: base for WebSocket URL in GameSocket (defaults to ws://localhost:3000)

Common commands
- Install deps
  - npm ci
- Dev server (Turbopack)
  - npm run dev
  - Opens on http://localhost:3000
- Build
  - npm run build
- Start production server
  - npm start
- Lint
  - npm run lint
- Static analysis (Qodana, uses qodana.yaml)
  - Docker (recommended when CLI not installed):
    - docker run --rm -it -v "${PWD}":/data -v "${PWD}/.qodana":/data/results -e QODANA_TOKEN=${QODANA_TOKEN} jetbrains/qodana-js:2025.2
  - Or, if qodana CLI is available: qodana scan --results-dir ./.qodana

Notes on testing
- No test framework or npm test script is configured in this repo. Running a single test is not applicable until tests are added.

High-level architecture
- Next.js App Router (src/app)
  - pages: app-level routes like /, /login, /museum/*, /pvp/*, /profile, etc.
  - providers: src/app/providers.js wraps the app with AuthProvider (from src/hooks/useAuth)
  - layout: src/app/layout.js sets global fonts, CSS, and renders a version watermark using NEXT_PUBLIC_APP_VERSION
- API routes (src/app/api)
  - auth/route.js: simple auth endpoints. Registration/log-in backed by Supabase players table. Tokens are mock strings (token_<id>_<ts>) used only for bearer checks in GET
  - players/route.js: CRUD for players using zod validation, maps camelCase fields (avatarUrl) to snake_case (avatar_url)
  - collection/route.js: read/upsert user card collections keyed by players.uid → collections.player_id
  - decks/route.js: CRUD for user decks (owner_id mapping exposed as ownerId in responses)
  - match/route.js: persisted match state in Supabase (matches). Implements versioned updates (optimistic concurrency) via expectedVersion and equality check on update
  - game/route.js: in-memory mock of rooms and active games for lobby-style flows (not persisted)
  - cards/route.js and user/route.js: mock data and derived views (filters, rankings, profiles)
  - admin/seed/route.js: seeds a high-level admin player and populates collections with all ids from data/cardsDatabase. Protected by ADMIN_SEED_TOKEN in production
- Data and game logic
  - src/data: domain data (cards.js, cardsDatabase.js, quizzes, regions). combatSystem imports cardsDatabase-derived constants
  - src/utils/gameLogic.js: GameEngine for turn/phase flow, draw/play/attack, damage resolution, deck validation and stats
  - src/utils/combatSystem.js: detailed combat modifiers (elemental, regional, seasonal, combos), crit/dodge, reflections
  - src/utils/api.js: browser-side API client abstraction (token storage, JSON fetch wrapper) with grouped services (auth, cards, decks, game, user, quiz, museum, config) and GameSocket ws helper
- Persistence and infra
  - src/lib/supabase.js: exposes supabase (browser) and supabaseAdmin (server). Server routes call requireSupabaseAdmin() and rely on SUPABASE_SERVICE_ROLE_KEY
  - src/db/client.js: drizzle/sql client for Vercel Postgres (present but not widely used in current routes)
  - src/db/kv.js: helpers for ephemeral match state on Vercel KV, including a versioned update pattern using a shadow version key for basic CAS semantics

Typical workflows
- Start the app in development
  - npm ci && npm run dev
- Lint sources
  - npm run lint
- Build and run locally in prod mode
  - npm run build && npm start
- Seed admin user and full collection (development)
  - curl -X POST "http://localhost:3000/api/admin/seed" -H "Content-Type: application/json" -H "x-seed-token: {{ADMIN_SEED_TOKEN}}" -d '{"username":"admin","email":"admin@example.com"}'
  - Replace {{ADMIN_SEED_TOKEN}} with your configured token when required

Conventions and rules from repo
- ESLint: eslint.config.mjs extends next/core-web-vitals
- Qodana: qodana.yaml sets linter image jetbrains/qodana-js:2025.2 and profile qodana.starter

Caveats and tips for agents
- Several API routes (cards, user, parts of game) are mock/in-memory and will reset on server restart. Persisted gameplay state uses Supabase (matches) or Vercel KV (kv.js helpers) when integrated
- Client API services in src/utils/api.js include endpoints that are not fully implemented server-side; prefer calling the API routes under src/app/api that exist in this repo
- Auth tokens are non-JWT mock strings; treat them only as placeholders for client navigation/guards

