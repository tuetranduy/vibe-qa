---
project_name: vibe-qa
created_by: Tuetran
created_at: 2026-01-06
updated_at: 2026-01-06
sections_completed:
  - technology_stack
  - monorepo_rules
  - language_specific
  - framework_specific
  - authentication_api
  - ai_integration
  - test_execution
  - testing
  - code_quality
  - workflow
  - dont_miss
status: complete
rule_count: 150
optimized_for_llm: true
---

## Technology Stack & Versions

**Monorepo Structure:**
- **Build System**: Turborepo (workspace orchestration, caching, parallel task execution)
- **Repository Pattern**: Monorepo with apps/ and packages/ structure
- **Node.js Version**: 18+ LTS with TypeScript

**Frontend (`apps/web`):**
- React 18+ with TypeScript
- Vite (build tool, dev server)
- shadcn/ui (Radix UI + Tailwind CSS)
- React Router v6 (routing)
- React Hook Form (forms)
- Zustand (client state) + TanStack Query (server state)
- WebSocket client (real-time updates)
- Vitest + React Testing Library

**Backend (`apps/api`):**
- Node.js 18+ with TypeScript
- Express.js 4+ (API framework)
- MySQL 8+ with connection pooling
- Prisma ORM (type-safe queries, migrations)
- JWT + bcrypt (authentication)
- Zod (validation)
- BullMQ + Redis (job queue)
- Playwright (browser automation)
- Socket.io (real-time communication)

**Shared Packages (`packages/`):**
- `shared-types`: TypeScript interfaces shared across apps
- `ai-client`: Multi-provider AI abstraction (OpenAI, Anthropic, Gemini, Ollama)
- `test-engine`: Playwright wrapper + test execution logic
- `database`: Prisma schema, migrations, client generation

**Infrastructure:**
- MySQL 8+ (primary database)
- Redis 7+ (job queue, caching)
- Docker + Docker Compose (local development)

All agents must use these exact technologies and major versions to ensure compatibility across the monorepo.

## Critical Implementation Rules

### Language-Specific Rules

- TypeScript strict mode must be enabled (`strict: true` in tsconfig).
- Use ES modules (`import`/`export` syntax) everywhere.
- Prefer async/await for all asynchronous code; avoid raw Promises.
- Always handle errors with try/catch in async functions.
- Never use `any` type except in unavoidable interop cases (must be commented).
- Use explicit return types for all exported functions.
- Use named exports; avoid default exports for shared modules.

### Framework-Specific Rules

**React:**
- Use functional components and React hooks only (no class components).
- All stateful logic must use hooks (`useState`, `useReducer`, `useEffect`, etc.).
- Use Zustand for client state, TanStack Query for server state.
- Co-locate feature components in `src/features/`, shared UI in `src/shared/components/`.
- Use React Router v6 for routing; protect routes requiring auth.
- Use Suspense and lazy loading for code splitting.

**Express:**
- Use async route handlers; always catch and forward errors to centralized middleware.
- Validate all request bodies and params (e.g., with Zod or Joi).
- Use JWT for authentication; never store secrets in code.
- Organize routes by feature in `src/modules/`.

**Prisma:**
- All DB access via generated Prisma client from `packages/database`.
- Never write raw SQL unless absolutely necessary (must be commented and reviewed).
- Use migrations for all schema changes; never edit DB schema manually.

### Testing Rules

- All tests must be colocated with the code they test as `*.test.ts(x)` or in `tests/` directories.
- Use Vitest for frontend, Jest for backend unit tests.
- Integration tests must use a real test database (never production data).
- Use mocks for external services (AI, email, Redis) in unit tests.
- E2E tests must cover the full user workflow and run against static test sites.
- Maintain at least 80% code coverage for all new code; critical paths must be 100% covered.
- Use descriptive test names and group related tests with `describe()` blocks.

### Code Quality & Style Rules

- Enforce ESLint and Prettier for all code; no commits allowed with lint or format errors.
- Use camelCase for variables/functions, PascalCase for components/classes, kebab-case for files.
- All exported functions and components must have JSDoc or TSDoc comments.
- Keep functions under 40 lines; split logic into helpers if longer.
- No magic numbers or strings; use named constants.
- Group imports: external, then internal, then styles/assets.
- All TODOs must include an owner and date.

### Development Workflow Rules

- Branch names: `feature/`, `bugfix/`, `chore/`, or `hotfix/` prefixes, then kebab-case description (e.g., `feature/test-run-api`).
- Commit messages: Conventional Commits format (e.g., `feat: add test run API`).
- All PRs require at least one reviewer approval and must pass CI before merge.
- PR description must reference related issue or requirement.
- Deployments are automated via GitHub Actions; never deploy from local machine.
- All environment variables must be managed via `.env` files and GitHub secrets.

### Critical Don't-Miss Rules

- Never commit secrets, API keys, or credentials to the repository.
- Never bypass centralized error handling or logging.
- Always sanitize user input and output, especially for test data and screenshots.
- Never use `any` or disable TypeScript checks to work around type errors.
- Never mutate state directly in React; always use state setters.
- Always clean up Playwright browser instances to avoid memory leaks.
- Never use production data in tests; always use fixtures or test DB.
- Always handle AI provider timeouts and fallbacks gracefully.
- Never hardcode configuration; always use environment variables.
- Always document edge cases and known limitations in code comments.

## Monorepo-Specific Rules

**Turborepo Workspace Rules:**
- All packages must be referenced by workspace name (e.g., `@vibe-qa/shared-types`), never by relative paths outside workspace boundaries.
- Run tasks from root using Turborepo: `turbo run build`, `turbo run test`, `turbo run lint`.
- Never install dependencies in individual apps/packages; always use root `package.json` workspaces.
- Task pipelines defined in `turbo.json` must specify dependencies (e.g., `build` depends on `^build`).
- Cache keys configured in `turbo.json` for optimal build performance; do not bypass cache unless necessary.

**Shared Package Usage:**
- `@vibe-qa/shared-types`: Import ALL shared TypeScript interfaces/types from here; never duplicate type definitions.
- `@vibe-qa/ai-client`: Use ONLY this package for AI provider interactions; never import OpenAI/Anthropic SDKs directly in apps.
- `@vibe-qa/test-engine`: All Playwright automation must go through this package; never create Playwright instances in apps.
- `@vibe-qa/database`: Import ONLY Prisma client from this package; all schema changes and migrations managed here.

**Cross-Package Dependencies:**
- Apps can depend on packages, but packages should NOT depend on apps.
- Packages can depend on other packages, but avoid circular dependencies.
- Use TypeScript path aliases defined in root `tsconfig.json` for clean imports.

**Build & Development:**
- Always run `turbo run dev` from root to start all apps concurrently.
- Package changes trigger automatic rebuilds in dependent apps (via Turborepo watch mode).
- Before committing, run `turbo run build test lint` to verify all workspaces.

## Authentication & API Patterns

**JWT Authentication Pattern:**
- All protected routes require `Authorization: Bearer <token>` header.
- Middleware extracts and verifies JWT before route handler execution.
- User ID from JWT payload used for ownership checks (users access only their own resources).
- Token expiration: 7 days; no refresh token in MVP (users must re-authenticate).
- Password hashing: bcrypt with cost factor 12.

**Password Requirements (Zod Validation):**
- Minimum 8 characters
- Must include: uppercase, lowercase, number, special character
- Validation enforced at signup and password change endpoints

**API Response Format (Standardized):**
```typescript
// Success response
{ data: T, meta: { requestId: string, timestamp: string } }

// Error response
{ error: { code: string, message: string, details?: any }, meta: { requestId: string } }
```

**Error Handling Pattern:**
- All async route handlers must wrap logic in try/catch.
- Throw custom error classes (e.g., `ValidationError`, `UnauthorizedError`) with HTTP status codes.
- Centralized Express error middleware formats all errors consistently.
- Never expose internal error details (stack traces) to clients in production.

**Request Validation Pattern:**
- Define Zod schemas for all request bodies, params, and query strings.
- Validate before business logic using middleware or at handler entry.
- Return 400 with validation errors if Zod parsing fails.

**Resource Ownership Pattern:**
- Extract `userId` from JWT payload in auth middleware.
- Attach to `req.user` object for route handlers.
- Query database with `WHERE userId = req.user.id` to enforce ownership.
- Return 404 (not 403) for resources that don't belong to user (security best practice).

**Rate Limiting Pattern:**
- Per-user rate limits identified by `req.user.id` from JWT.
- Test run creation: 10 requests/hour per user.
- General API: 100 requests/minute per user.
- Include rate limit headers in all responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## AI Provider & Integration Patterns

**AI Provider Abstraction Layer (`@vibe-qa/ai-client`):**
- **Never import AI SDKs directly** (OpenAI, Anthropic, Google) in apps; always use `@vibe-qa/ai-client`.
- Provider abstraction must normalize responses from all providers into a unified format.
- Support multiple providers: OpenAI, Anthropic (Claude), Google (Gemini), Ollama (local models).
- Provider selection: System-wide default with optional user override (via API config or user preferences).

**API Response Normalization:**
- Each provider has different API structures (OpenAI completions, Anthropic messages, local model responses).
- `@vibe-qa/ai-client` must normalize all responses to a common interface for test generation pipeline.
- Include provider-agnostic error handling and retry logic within the abstraction layer.

**Timeout & Fallback Handling:**
- Default AI timeout: 60 seconds (configurable per provider).
- Implement graceful fallback: If primary provider fails/times out, try secondary provider if configured.
- Never block test execution indefinitely; return timeout error to user if all providers fail.

**Rate Limit Handling:**
- Respect provider-specific rate limits (track request counts, implement backoff).
- Queue AI requests when rate limit approached; inform user of delays.
- Different rate limits per provider (OpenAI token-based, Anthropic message-based, local unlimited).

**Confidence Scoring:**
- All AI-generated test scenarios must include confidence scores (0-100%).
- Minimum acceptable confidence: 70% (per architecture NFRs).
- Flag tests below threshold for user review before execution.

**Testing AI Integration:**
- Use VCR pattern (record/replay) to avoid token costs during tests.
- Mock `@vibe-qa/ai-client` in unit tests; use recorded fixtures for integration tests.
- Never call live AI APIs in automated test suites.

## Test Execution & Browser Automation Patterns

**Playwright Abstraction (`@vibe-qa/test-engine`):**
- **Never create Playwright browser instances directly** in apps; always use `@vibe-qa/test-engine`.
- Package handles browser lifecycle: launch, page creation, navigation, screenshot capture, cleanup.
- **Critical**: Always close browser instances in `finally` blocks to prevent memory leaks.

**SPA-Aware Automation:**
- Detect client-side routing (React Router, Vue Router, Angular Router).
- Wait for dynamic content rendering (network idle, DOM stability checks).
- Handle async operations with appropriate timeouts and retry logic.

**Screenshot Capture:**
- Capture screenshots during test execution for bug reproduction.
- Store metadata (timestamp, test step, URL) with each screenshot.
- PII sanitization: Detect and redact sensitive data before storage.
- 30-day retention enforced automatically; expired screenshots purged via cron job.

**Browser Cleanup:**
- Always terminate browser instances after test completion, cancellation, or failure.
- Use `try-finally` blocks to ensure cleanup even on errors.
- Track active browser sessions to prevent resource exhaustion.

**Test Execution Timeout:**
- Default timeout: Configurable per test (based on test complexity).
- Enforce timeout at job queue level to prevent infinite runs.
- Cancel button must immediately terminate browser instances and mark job as canceled.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in the vibe-qa project.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- If new patterns emerge during implementation, document them here.

**For Humans:**
- Keep this file lean and focused on agent needs.
- Update when technology stack or architectural decisions change.
- Review quarterly to remove outdated or obvious rules.
- Add new rules when agents make consistent mistakes.

**Last Updated:** 2026-01-06
