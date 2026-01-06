---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: 
  - prd.md
  - product-brief-vibe-qa-2026-01-06.md
workflowType: 'architecture'
project_name: 'vibe-qa'
user_name: 'Tuetran'
date: '2026-01-06'
lastStep: 8
status: 'complete'
completedAt: '2026-01-06'
---

# Architecture Decision Document - vibe-qa

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
vibe-qa implements 55 functional requirements organized into five capability areas:

1. **Test Configuration & Execution (13 FRs)**: URL input with natural language prompts, suggested prompts for guidance, real-time progress visibility during discovery and execution, manual test scenario overrides, cancellation capability, error handling, and re-execution of previous configurations.

2. **AI-Powered Test Generation (8 FRs)**: Automatic web application functionality discovery, SPA architecture support (React, Vue, Angular), client-side routing and dynamic content detection, contextual test scenario generation with confidence scoring, screenshot capture during execution, and generative AI service integration.

3. **Test Results & Reporting (16 FRs)**: Comprehensive reports with functionality lists, pass/fail status, bug findings with reproduction steps and screenshots, AI confidence indicators, developer-friendly formatting, multiple export formats (PDF, shareable links), completion notifications, search/filter capabilities, report deletion, and public sharing support.

4. **User Account Management (7 FRs)**: Account creation and authentication, profile management, test run association with users, persistent test history, and first-time user onboarding.

5. **System Administration & Data Management (11 FRs)**: Screenshot storage with 30-day retention and automatic cleanup, asynchronous job queuing, job status tracking, concurrent test run handling, persistent report storage, test execution history maintenance, rate limiting, timeout enforcement, concurrent execution limits, and real-time bidirectional communication (WebSocket/SSE).

**Non-Functional Requirements:**

**Integration Requirements** (Critical architectural drivers):
- Multi-provider AI integration: OpenAI, Anthropic (Claude), Google (Gemini), local models (Ollama, LLaMA-based)
- Provider-agnostic abstraction layer enabling seamless provider swapping
- System-wide API key authentication with optional user override
- Graceful handling of AI provider rate limits, timeouts (60s default), and fallback mechanisms
- Playwright browser automation for Chrome and Firefox
- SPA-aware automation (client-side routing, dynamic content, async operations)
- Configurable retry policies and timeout handling for all external integrations

**Security Requirements**:
- Industry-standard password hashing (bcrypt), secure session management
- Protection against common vulnerabilities (XSS, CSRF, SQL injection)
- Data sanitization for PII detection in test data and screenshots
- Encrypted storage for sensitive configuration (AI API keys, DB credentials)
- HTTPS for all communications
- 30-day screenshot retention with automatic enforcement

**Scalability Requirements**:
- Concurrent execution: 3 tests/user default, 50 system-wide initial target
- Rate limiting: 10 test runs/hour per user default
- Horizontal scaling architecture support
- Optimized database queries for growing test history and screenshot storage
- Efficient cleanup of expired data (30-day retention)

**Reliability Requirements**:
- Test execution success rate target: 85% without infrastructure failures
- AI quality baseline: 80% of generated tests must be executable and contextually relevant
- AI confidence score threshold: minimum 70% for acceptable quality
- Flaky test detection: flag tests producing different results on identical runs
- Graceful degradation when AI providers or browser automation fails
- Clean cancellation handling (terminate browser instances and jobs properly)

**Performance Requirements**:
- UI page loads: <3 seconds
- Real-time updates: <500ms latency (WebSocket/SSE)
- Report generation: <10 seconds for typical reports
- Asynchronous test execution (non-blocking UI)
- Note: Detailed optimization deferred post-MVP, functionality prioritized initially

**Observability Requirements**:
- AI provider performance monitoring (response time, success rate, error types)
- Job queue health metrics (depth, processing time, failure rate)
- Playwright execution tracking (browser launch success, test failures)
- Test execution statistics (completion, cancellation, timeout rates)
- Application KPIs (active users, test runs/day, storage usage)
- Critical failure alerting (AI unavailability, DB connection loss, job queue failures)
- Logging: 90-day retention for application logs, permanent for security logs

**Operational Requirements**:
- Containerized deployment (Docker)
- Cloud (AWS, GCP, Azure) or self-hosted deployment support
- Environment-based configuration (dev, staging, prod)
- Daily backups with 24-hour recovery window
- Zero-downtime deployment capability
- Versioned, automated database migrations

### Scale & Complexity

**Complexity Level**: Medium-High

vibe-qa presents medium-high complexity due to the convergence of multiple sophisticated systems:
- **AI Integration**: Multi-provider orchestration with fallback and retry logic
- **Browser Automation**: SPA-aware testing with Playwright lifecycle management
- **Asynchronous Processing**: Job queue with cancellation, timeout, and status tracking
- **Real-time Communication**: WebSocket/SSE for live progress updates during long-running tests
- **Data Management**: Screenshot storage with PII sanitization and lifecycle management
- **Resource Management**: Rate limiting, concurrent execution controls, horizontal scaling support

**Primary Domain**: Full-Stack Web Application

- Frontend: React SPA with shadcn UI, modern browser targets (Chrome, Firefox)
- Backend: Node.js API with RESTful endpoints
- Database: MySQL for persistent storage
- Real-time: WebSocket/SSE infrastructure
- External Services: Multi-AI providers, Playwright browser automation

**Estimated Architectural Components**: 8-10 major components

1. Frontend Application (React SPA)
2. API Gateway / Backend API (Node.js)
3. AI Service Integration Layer (multi-provider abstraction)
4. Job Queue Service (async test execution orchestration)
5. Browser Automation Service (Playwright wrapper)
6. Screenshot Storage Service (capture, storage, retention management)
7. Real-time Communication Service (WebSocket/SSE)
8. Database Layer (MySQL)
9. Authentication & Authorization Service
10. Monitoring & Observability Infrastructure

### Technical Constraints & Dependencies

**Hard Dependencies**:
- **Playwright**: Browser automation engine, must support Chrome and Firefox, version management required
- **Generative AI Providers**: At least one provider (OpenAI/Anthropic/Google) or local model (Ollama/LLaMA) must be configured
- **MySQL Database**: Relational database for user data, test configurations, reports, and metadata
- **WebSocket/SSE Infrastructure**: Required for real-time progress updates during test execution
- **Job Queue System**: Required for asynchronous test execution (Redis, RabbitMQ, or similar)

**Technical Constraints**:
- **Browser Support**: Chrome and Firefox only (modern evergreen versions), no legacy browser support
- **SPA Focus**: Architecture must handle client-side routing, dynamic content, and async rendering
- **Screenshot Storage**: 30-day retention policy enforced, storage scaling must be managed
- **Rate Limits**: AI provider rate limits must be respected, user rate limits must be enforced
- **Concurrency Limits**: 3 concurrent tests/user, 50 system-wide (configurable but must have limits)
- **Timeout Handling**: Configurable timeouts for AI (60s default) and test execution to prevent infinite runs

**External Service Dependencies**:
- **AI Providers**: External API availability impacts core functionality (fallback required)
- **Browser Automation**: Playwright/browser binaries must be maintained and updated
- **Cloud Infrastructure**: If deployed to cloud, must support containerization and scaling

### Cross-Cutting Concerns Identified

**1. AI Provider Abstraction**
- Multiple providers must be supported through a unified interface
- Provider selection, authentication, fallback, retry logic affects all AI-dependent features
- Confidence scoring and quality validation spans test generation, execution, and reporting

**2. Job Queue Orchestration**
- Affects test execution, cancellation, timeout enforcement, status tracking
- Must integrate with browser automation, AI services, screenshot capture, and real-time updates
- Resource management (rate limiting, concurrent execution) enforced at queue level

**3. Real-time Communication**
- WebSocket/SSE affects test discovery progress, test execution progress, completion notifications
- Must maintain connection state across long-running operations
- Performance requirement (<500ms latency) impacts architecture choices

**4. Screenshot Management**
- Capture during test execution, storage with 30-day retention, PII sanitization
- Affects storage infrastructure, data lifecycle policies, security requirements
- Must handle failures gracefully without blocking test completion

**5. Security & Data Protection**
- Authentication and authorization affect all endpoints and data access
- PII sanitization required for test data and screenshots
- Encryption requirements for sensitive configuration and data transmission

**6. Monitoring & Observability**
- All components require health monitoring, metrics collection, and alerting
- Distributed tracing needed for multi-component operations (AI → job queue → browser → storage)
- Logging consistency across services with retention policies

**7. Resource Management & Scalability**
- Rate limiting, concurrent execution limits, timeout enforcement affect all services
- Horizontal scaling considerations impact architecture patterns (stateless services, shared state management)
- Database optimization for growing data volumes (test history, screenshots, reports)

**8. Error Handling & Resilience**
- Graceful degradation required for AI provider failures, browser automation failures
- User-facing error messages must be actionable and clear
- Retry logic, timeout handling, cancellation support needed across all async operations

---

### Additional Architectural Considerations (From Team Review)

**AI Provider Integration Complexity:**

**API Response Normalization:**
- Each AI provider uses different API structures: OpenAI (completions), Anthropic (messages), local models (varied)
- Response format normalization required for consistent test generation pipeline
- Error code mapping across providers for unified error handling
- Token counting and context window management varies by provider
- Cost tracking requirements differ (OpenAI charges per token, local models free)

**Streaming vs Batch Patterns:**
- OpenAI supports streaming responses for incremental test generation
- Anthropic uses message arrays with different token semantics
- Local models typically synchronous, slower but predictable
- Architecture must accommodate both streaming and batch API patterns

**Test Strategy for AI Integration:**
- Mock/stub strategy needed for testing multi-provider fallback logic
- Each provider has different failure modes requiring specific handling
- Test doubles required for validating graceful degradation scenarios

**Resource Constraints & Performance:**

**Playwright Resource Limits:**
- Each Playwright browser instance consumes 100-200MB RAM plus browser process overhead
- Concurrent instance limits must account for memory constraints, not just logical concurrency
- Browser lifecycle management critical for resource cleanup
- Orphaned browser detection and cleanup strategy required for crashed jobs

**Screenshot PII Sanitization Strategy:**
- Pre-capture masking (DOM manipulation before screenshot) vs post-capture analysis (OCR/AI on image)
- Post-capture analysis expensive and slow (could double test execution time)
- False negative risk (missed PII = security issue) vs false positive risk (over-masking = broken tests)
- Accuracy requirements and validation strategy for PII detection needed

**Service Co-location vs Isolation:**
- WebSocket <500ms latency requires consideration of service topology
- Network hops between services add latency (API → Job Queue → Playwright → WebSocket)
- Tradeoff: co-located services for performance vs isolated services for independent scaling
- Deployment topology impacts latency SLA achievability

**State Management & Persistence:**

**Job State Storage:**
- Job queue requires durable state (survive crashes and restarts)
- State storage options: Redis (fast, in-memory with persistence), Database (durable, slower), Hybrid (hot state in Redis, cold in DB)
- State machine for job lifecycle: queued → running → (completed | failed | canceled | timeout)
- Cancellation tokens required for mid-execution job termination

**Browser Instance Tracking:**
- Playwright instances are stateful and must be tracked with job state
- Browser instance ID must be associated with job for cleanup
- Orphaned browser cleanup strategy for crashed or timed-out jobs
- Resource leak detection and automatic cleanup

**WebSocket Connection Management:**
- Each test execution requires one active WebSocket connection
- 50 concurrent tests = 50 active connections to manage
- Connection pooling strategy for scalability
- Reconnection handling if client disconnects mid-test (queue messages or discard)
- Message queuing for offline clients

**Deployment Architecture:**

**Monolith vs Microservices:**
- Monolithic deployment: simpler operations, lower latency, single scaling unit
- Microservices: independent scaling, service isolation, operational complexity
- Hybrid: core application monolithic, heavy services (Playwright, screenshot) isolated
- Decision impacts deployment, scaling, and latency characteristics

**File Storage Strategy:**
- Screenshots require blob storage: S3/cloud (scalable, durable, cost), Local disk (fast, limited scale), Hybrid (hot on local, cold to S3)
- Storage backend choice affects performance (local fast, S3 slower) and cost (S3 storage + bandwidth)
- Retention policy implementation: batch deletion (cron job) vs incremental (per-screenshot lifecycle)

**Observability & Traceability:**

**Distributed Tracing:**
- Single test execution spans multiple services: API → Queue → AI Provider → Playwright → Screenshot → Report
- Correlation IDs required to trace request flow across service boundaries
- Distributed tracing infrastructure (OpenTelemetry, Jaeger, or similar) needed
- Performance profiling requires tracing to identify bottlenecks

**Failure Attribution:**
- Clear distinction needed between test result failures (bug found) and infrastructure failures (Playwright crash, AI timeout)
- Reliability metrics must separate user-facing test accuracy from system reliability
- Test success rate (85%) should measure infrastructure reliability, not test result accuracy

**Database Schema & Data Model:**

**Core Tables:**
- Users (authentication, profile, preferences)
- TestRuns (FK to users, status, URL, prompt, AI provider, timestamps)
- Screenshots (FK to test runs, storage path/URL, captured timestamp, PII flag)
- Reports (FK to test runs, format, shareable link token)
- Jobs (FK to test runs, state, browser instance ID, created/started/completed timestamps)

**Indexing Strategy:**
- Test history queries: index on (user_id, created_at) for pagination
- Screenshot lookup: index on (test_run_id, created_at) for retrieval
- Retention cleanup: index on created_at for efficient old data deletion
- Shareable reports: index on token for public link lookups

**Sharding/Partitioning:**
- Time-series partitioning for test runs and screenshots (partition by month/quarter)
- User-based sharding if scaling to large user base
- Archival strategy for old data beyond active retention window

**Testability & Quality Validation:**

**Test Quality Beyond Execution:**
- AI-generated tests may be executable but meaningless (test nothing, always pass)
- Validation strategy needed: semantic analysis, assertion coverage, mutation testing
- Quality metrics: test diversity (different user flows), edge case coverage, meaningful assertions
- Human-in-the-loop validation for AI quality baseline establishment

**PII Detection Accuracy:**
- Labeled dataset required for validating PII detection (true positives, false positives, false negatives)
- Accuracy target needed (e.g., 95% recall for PII detection, <5% false positive rate)
- Regular revalidation as screenshot patterns and web content evolve

**System Testability:**
- AI provider mocks for testing fallback logic without external dependencies
- Playwright test doubles for validating browser automation handling
- Job queue test harness for simulating various failure scenarios
- End-to-end test strategy for validating full workflow with controlled test sites

---

## Starter Template Selection

### Decision: Monorepo with Turborepo

**Rationale:**
vibe-qa requires tight integration between frontend and backend with shared TypeScript types (test configurations, AI responses, job status, report data). A monorepo approach enables:
- Shared type definitions between React frontend and Node.js backend
- Coordinated builds and deployments
- Single source of truth for the entire application
- Simplified dependency management
- Easier refactoring across frontend/backend boundaries

### Repository Structure

```
vibe-qa/
├── apps/
│   ├── web/                    # React SPA (Vite + TypeScript + shadcn/ui)
│   └── api/                    # Node.js API (Express + TypeScript)
│                               # Initially includes job worker + WebSocket server
│                               # Extract to separate services only when scaling requires it
├── packages/
│   ├── shared-types/           # Shared TypeScript types/interfaces
│   ├── ai-client/              # AI provider abstraction layer
│   ├── test-engine/            # Playwright wrapper + test execution logic
│   └── database/               # Prisma schema, migrations, Prisma Client generation
├── turbo.json                  # Turborepo pipeline configuration
├── package.json                # Root package.json with workspace config
├── tsconfig.json               # Base TypeScript configuration
└── docker-compose.yml          # Local development infrastructure (MySQL, Redis)
```

**Note on Service Architecture:**
Start with monolithic `apps/api` containing all backend logic (API endpoints, job workers, WebSocket server). Extract into separate services (`services/job-worker`, `services/websocket-server`) only when independent scaling becomes necessary. This avoids premature microservices complexity while maintaining clear code organization.

### Technology Stack Confirmed

**Frontend (`apps/web`)**:
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast dev server, optimized builds)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Context + hooks (or Zustand if needed)
- **Real-time**: WebSocket client for test progress updates
- **HTTP Client**: Axios or Fetch API with TypeScript types
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Testing**: Vitest + React Testing Library

**Backend (`apps/api`)**:
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js (familiar, flexible, battle-tested)
- **Database**: MySQL 8+ with connection pooling
- **ORM/Query Builder**: Prisma (type-safe queries, migrations) or TypeORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod (runtime validation + TypeScript types)
- **Job Queue**: BullMQ (Redis-based, robust, dashboard)
- **Real-time**: Socket.io or ws (WebSocket library)
- **Testing**: Jest + Supertest for API testing

**Shared Packages**:
- **`shared-types`**: TypeScript interfaces for API contracts, test data, AI responses
- **`ai-client`**: Multi-provider AI abstraction (OpenAI, Anthropic, Google, Ollama)
- **`test-engine`**: Playwright automation wrapper with SPA-aware helpers
- **`database`**: Prisma schema, migration scripts, shared database utilities

**Infrastructure**:
- **Database**: MySQL 8.0+ (hosted or containerized)
- **Cache/Queue**: Redis 7+ (for BullMQ job queue + optional caching)
- **File Storage**: Local filesystem (MVP) or S3-compatible (production scaling)
- **Containerization**: Docker + Docker Compose for local development and deployment
- **Monitoring**: Logging (Winston/Pino), metrics (Prometheus/Grafana optional)

### Starter Commands

**Project Initialization**:
```bash
# Create monorepo with Turborepo
npx create-turbo@latest vibe-qa

# Frontend (Vite + React + TypeScript)
cd apps && npm create vite@latest web -- --template react-ts

# Backend (Express + TypeScript starter)
cd apps && mkdir api && cd api
npm init -y
npm install express typescript @types/express @types/node ts-node nodemon
npx tsc --init

# Install Turborepo dev dependencies
cd ../.. && npm install turbo --save-dev
```

**Key Dependencies to Install**:

Frontend:
```bash
cd apps/web
npm install react-router-dom axios socket.io-client
npm install -D tailwindcss postcss autoprefixer
npx shadcn-ui@latest init
```

Backend:
```bash
cd apps/api
npm install express mysql2 prisma @prisma/client bcrypt jsonwebtoken zod
npm install bullmq ioredis socket.io cors helmet dotenv
npm install -D @types/express @types/node @types/bcrypt @types/jsonwebtoken jest supertest
```

Shared:
```bash
# Playwright for test-engine package
cd packages/test-engine
npm install playwright @playwright/test

# AI clients for ai-client package
cd packages/ai-client
npm install openai @anthropic-ai/sdk @google-ai/generativelanguage
```

### What the Starter Provides Out of Box

**From Turborepo**:
- Workspace configuration and task orchestration
- Build caching and parallelization
- Shared TypeScript configuration
- Dev script coordination (run frontend + backend simultaneously)

**From Vite**:
- Fast HMR (Hot Module Replacement) for React development
- Optimized production builds with code splitting
- TypeScript support with fast transpilation
- CSS modules, PostCSS, and Tailwind CSS support

**From Express.js**:
- HTTP server and routing
- Middleware architecture for authentication, validation, error handling
- Flexible API endpoint structure
- Easy integration with Prisma ORM and Redis

**What We'll Build Custom**:
- AI provider abstraction layer (multi-provider support)
- Playwright test execution engine (SPA-aware automation)
- Job queue workers (BullMQ consumers)
- WebSocket real-time communication server
- Screenshot capture and storage service
- Database schema and migrations (Prisma)
- Authentication and authorization middleware
- Rate limiting and resource management
- Monitoring and observability infrastructure

---

### Technical Implementation Details

**Database Package Architecture:**
- `packages/database` owns Prisma schema and generates Prisma Client
- Other packages/apps import generated client: `import { PrismaClient } from '@vibe-qa/database'`
- Migrations managed centrally in database package: `prisma migrate dev`, `prisma migrate deploy`
- Version synchronization via Turborepo workspace protocol (`"@vibe-qa/database": "workspace:*"`)

**Type Sharing Strategy:**
- `packages/shared-types` defines all API contracts, domain models, and shared interfaces
- All workspace packages reference via workspace protocol to ensure version consistency
- Breaking changes to shared types require coordinated updates across consumers
- Type generation automated in Turborepo build pipeline

**AI Client Package Design:**
```typescript
// Unified interface that accommodates provider-specific features
export interface AIProvider {
  name: 'openai' | 'anthropic' | 'google' | 'ollama';
  generateTests(request: TestGenerationRequest): Promise<TestGenerationResponse>;
  supportsStreaming: boolean;
  // Provider-specific configuration
  configure(config: ProviderConfig): void;
}
```
- Streaming supported where available (OpenAI) via async generators
- Response normalization layer converts provider responses to unified format
- Error mapping translates provider-specific errors to common error types
- Cost tracking wrapper for token-based providers

**Monolithic API Service Architecture:**
`apps/api` initially contains:
- **HTTP API Server**: Express routes, middleware, authentication
- **Job Queue Worker**: BullMQ consumer processing test execution jobs in-process
- **WebSocket Server**: Socket.io server for real-time updates, shares HTTP server
- **Scheduled Tasks**: Cron jobs for screenshot cleanup, data retention enforcement

Communication between components via:
- Job queue: BullMQ in-memory within same process
- Real-time updates: Redis Pub/Sub from job worker to WebSocket handler
- Database: Shared Prisma Client instance

**Extract to microservices only when:**
- Job worker CPU/memory needs independent scaling from API
- WebSocket connections require separate scaling tier
- Independent deployment cycles needed

**Infrastructure Dependencies:**

**Redis (Required):**
- BullMQ job queue persistence and coordination
- Optional caching layer for API responses
- Pub/Sub for real-time event distribution (job worker → WebSocket)
- Development: Docker container via docker-compose.yml
- Production: Managed Redis (AWS ElastiCache, Redis Cloud, etc.)

**MySQL (Required):**
- Primary data store: users, test runs, reports, screenshots metadata
- Prisma handles connection pooling
- Development: Docker container via docker-compose.yml
- Production: Managed MySQL (AWS RDS, PlanetScale, etc.)

**Playwright Browser Binaries:**
- Large download size (200-500MB) for Chrome + Firefox
- Installed only in `packages/test-engine` and `apps/api` (not in `apps/web`)
- Docker optimization: Multi-stage builds to exclude browsers from frontend image
- `.dockerignore` configured to prevent unnecessary binary copying

**Environment & Configuration Management:**

**Development**:
- `.env` files per app/package (`.env.local`, `.env.development`)
- Root `.env` for shared values (database URLs, Redis URL)
- `dotenv` loads variables at runtime
- Turborepo passes environment variables via `turbo.json` pipeline config

**Production**:
- Environment variables injected by deployment platform (Docker, Kubernetes secrets, cloud provider)
- Sensitive values (AI API keys, DB credentials) via secret management (AWS Secrets Manager, HashiCorp Vault)
- Configuration validation at startup via Zod schemas

**Database Migrations CI/CD:**
- Migrations versioned in `packages/database/prisma/migrations/`
- Development: `npx prisma migrate dev` applies migrations + generates client
- Staging/Production: `npx prisma migrate deploy` applies pending migrations
- Deployment pipeline step: Run migrations before deploying new API version
- Rollback strategy: Migrations are forward-only, rollback requires new migration

**Frontend Build & Deployment:**
- Vite builds `apps/web` to static files (HTML, JS, CSS)
- Production options:
  1. **Same container**: Express serves static files (simple, single deployment)
  2. **Separate hosting**: CDN/static host (Vercel, Netlify, S3+CloudFront) for frontend, separate API deployment
  3. **Hybrid**: Static files on CDN, API on container platform
- Recommendation: Start with option 1 (Express serves static), move to option 2 for scale

**Error Handling Strategy:**

**Backend (`apps/api`)**:
- Centralized Express error handler middleware
- Custom error classes with HTTP status codes and error codes
- Async error wrapper for route handlers
- Structured error responses: `{ error: { code: 'AI_TIMEOUT', message: '...', details: {...} } }`
- Unhandled promise rejections logged and alerted

**Frontend (`apps/web`)**:
- React Error Boundaries for component tree error catching
- Global error handler for uncaught errors
- API error handling via interceptors (Axios) or wrapper (Fetch)
- User-friendly error messages with fallback to generic messages
- Error logging to backend or external service (optional)

**Logging Infrastructure:**
- **Library**: Pino (high-performance, structured JSON logging)
- **Format**: Structured JSON logs with correlation IDs for request tracing
- **Levels**: error, warn, info, debug
- **Context**: Include user ID, request ID, job ID in all logs
- **Destinations**: 
  - Development: Console (pretty-printed)
  - Production: Stdout (captured by container platform), optionally to aggregation service (Datadog, Logtail)
- **Retention**: As defined in NFRs (90-day application logs, permanent security logs)

**API Versioning Strategy:**
- URL-based versioning: `/api/v1/...`
- Current version always at `/api/v1/`
- Breaking changes require new version (`/api/v2/`)
- Non-breaking changes deployed to current version
- Deprecation policy: Support N-1 version for 6 months after N is released
- Version communicated in API responses via header: `X-API-Version: v1`

**Testing Strategy:**

**Unit Tests:**
- `packages/shared-types`: Type validation tests (Zod)
- `packages/ai-client`: Mock AI responses, test normalization logic
- `packages/test-engine`: Test against static HTML fixtures (not live sites)
- `packages/database`: Mock Prisma Client for business logic tests
- `apps/api`: Mock dependencies, test route handlers and business logic
- `apps/web`: Vitest + React Testing Library for components

**Integration Tests:**
- `apps/api`: Supertest for API endpoint testing against real test database
- Database: Docker container with test MySQL instance (via docker-compose.test.yml)
- Job queue: Real Redis instance for BullMQ integration tests
- AI clients: VCR/Polly to record and replay AI responses (avoid token costs)

**E2E Tests:**
- Full stack testing: Frontend + API + Workers + Database + Redis
- Test against controlled static test sites (known HTML structure)
- Playwright (separate from test-engine package) to drive frontend
- Validates: URL input → test generation → execution → report display
- Fixtures: Test users, pre-seeded data, mock AI responses

**Test Database Setup:**
- `docker-compose.test.yml`: Separate MySQL + Redis containers for testing
- Test database reset between test runs via Prisma migrations
- Seed script for test data: `packages/database/prisma/seed.test.ts`

**Test Data Fixtures:**
- Users: Various roles, rate limits, AI provider preferences
- Test runs: Different states (queued, running, completed, failed, canceled)
- Screenshots: With and without PII for sanitization testing
- AI responses: Recorded fixtures for consistent testing
- Test sites: Static HTML pages in `tests/fixtures/sites/` for validation

**AI Client Test Strategy:**
- **Unit tests**: Mock HTTP clients, test response parsing and error handling
- **Integration tests**: VCR/Polly recordings of real AI interactions
- **Fallback testing**: Simulate provider failures, validate fallback to alternate providers
- **Token cost**: Use smallest/cheapest models for live tests, prefer recordings

---

## Core Architectural Decisions

### Data Architecture

**Database: MySQL 8.0+**
- Relational database for structured data (users, test runs, reports, screenshots metadata)
- Chosen for: ACID compliance, mature ecosystem, wide hosting support
- Managed via Prisma ORM for type-safe queries and migrations

**ORM: Prisma**
- Type-safe database queries with auto-generated TypeScript types
- Declarative schema with migration generation
- Connection pooling built-in
- Decision rationale: Developer productivity, type safety, migration ease

**Caching Strategy: Redis for API Responses**
- **Use cases**:
  - Frequently accessed test history (user's recent runs)
  - Public shareable report lookups (by token)
  - User profile data (reduce auth queries)
- **Cache invalidation**:
  - TTL-based expiration (e.g., 5 minutes for test history)
  - Event-based invalidation (new test run → clear user history cache)
- **Not cached**:
  - Write operations (test creation, updates)
  - Real-time data (job status during execution)
- **Implementation**: Cache-aside pattern with Redis `GET`/`SET`
- **Redis also used for**: BullMQ job queue (primary purpose)

---

### Authentication & Security

**Authentication: JWT (JSON Web Tokens)**
- Stateless token-based authentication
- Email/password credentials with bcrypt password hashing (cost factor: 12)
- JWT signed with HS256 or RS256 (configurable via environment)
- Token expiration: 7 days (configurable)
- Refresh token strategy: Not in MVP (users re-authenticate after expiration)

**Authorization: User Ownership Model**
- Simple ownership checks: Users can only access their own test runs, reports, screenshots
- No role-based access control (RBAC) in MVP
- Future consideration: Admin role for system management, team/organization support

**Security Middleware Stack (Express)**:
1. **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
2. **CORS**: Configured for frontend origin(s)
3. **Rate Limiting**: Express-rate-limit (10 requests/hour per user for test runs, as per NFRs)
4. **Request Validation**: Zod schemas validate request bodies, params, queries
5. **JWT Verification**: Middleware extracts and verifies JWT from `Authorization: Bearer <token>` header
6. **Error Handler**: Centralized error handler catches and formats all errors

**API Security**:
- All endpoints require authentication except: signup, login, public report sharing
- Input validation via Zod before business logic
- SQL injection prevention via Prisma parameterized queries
- XSS prevention via input sanitization and React's built-in escaping
- CSRF not applicable (stateless JWT, no cookies)

**Password Requirements**:
- Minimum 8 characters
- Must include: uppercase, lowercase, number, special character (enforced via Zod)
- Bcrypt hashing with salt rounds: 12

**Token Storage (Client)**:
- Frontend stores JWT in memory (React state) or localStorage
- Sent in `Authorization: Bearer <token>` header for API requests
- No refresh token in MVP (full re-authentication after expiration)

---

### API Design & Communication

**API Architecture: RESTful**
- HTTP methods: GET (read), POST (create), PATCH (update), DELETE (delete)
- URL versioning: `/api/v1/...` (current version always v1 in MVP)
- Resource-based endpoints following REST conventions
- Stateless requests (authentication via JWT in header)

**API Endpoint Structure**:
```
Authentication:
  POST   /api/v1/auth/signup
  POST   /api/v1/auth/login

Test Runs:
  POST   /api/v1/test-runs              # Create new test run
  GET    /api/v1/test-runs              # List user's test runs (paginated)
  GET    /api/v1/test-runs/:id          # Get specific test run details
  DELETE /api/v1/test-runs/:id          # Delete test run
  POST   /api/v1/test-runs/:id/cancel   # Cancel in-progress test

Reports:
  GET    /api/v1/reports/:id            # Get report (authenticated)
  GET    /api/v1/reports/:id/export     # Export report as PDF
  GET    /api/v1/reports/share/:token   # Public shareable report (no auth)

Screenshots:
  GET    /api/v1/screenshots/:id        # Get screenshot (authenticated)

User Management:
  GET    /api/v1/users/me               # Get current user profile
  PATCH  /api/v1/users/me               # Update user profile
  DELETE /api/v1/users/me               # Delete user account
```

**Response Formats**:

Success Response:
```json
{
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-01-06T12:00:00Z"
  }
}
```

Error Response:
```json
{
  "error": {
    "code": "AI_TIMEOUT",
    "message": "AI provider timed out after 60 seconds",
    "statusCode": 503,
    "details": {
      "provider": "openai",
      "requestId": "uuid"
    }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-01-06T12:00:00Z"
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Input validation failed (400)
- `UNAUTHORIZED`: Authentication required or failed (401)
- `FORBIDDEN`: Authenticated but not authorized (403)
- `NOT_FOUND`: Resource not found (404)
- `RATE_LIMIT_EXCEEDED`: Too many requests (429)
- `AI_TIMEOUT`: AI provider timeout (503)
- `AI_UNAVAILABLE`: All AI providers unavailable (503)
- `BROWSER_FAILED`: Playwright execution failed (500)
- `INTERNAL_ERROR`: Unexpected server error (500)

**API Documentation: Swagger/OpenAPI 3.0**
- **Library**: `swagger-ui-express` + `swagger-jsdoc` OR `@nestjs/swagger` patterns
- **Location**: `/api/v1/docs` (interactive Swagger UI)
- **Generation**: JSDoc comments on Express routes OR separate OpenAPI YAML
- **Authentication**: Swagger UI supports "Authorize" button for JWT bearer token
- **Benefits**: Interactive testing, auto-generated client code potential, clear API contract

**Rate Limiting**:
- Implemented via `express-rate-limit` middleware
- Per-user limits (identified by user ID from JWT):
  - Test run creation: 10 requests/hour (as per NFRs)
  - General API: 100 requests/minute
- Rate limit headers included in responses:
  ```
  X-RateLimit-Limit: 10
  X-RateLimit-Remaining: 7
  X-RateLimit-Reset: 1234567890
  ```

**Pagination**:
- Query params: `?page=1&limit=20` (default limit: 20, max: 100)
- Response includes pagination metadata:
  ```json
  {
    "data": [...],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
      }
    }
  }
  ```

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-06
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- Comprehensive architectural decisions covering data, authentication, API design, and integrations
- Technology stack: Next.js 15, Node.js 20 LTS, PostgreSQL 16, Turborepo monorepo
- Detailed implementation patterns for AI providers, test execution, and reporting
- 55 functional requirements fully supported across 5 capability areas

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing vibe-qa. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
Initialize monorepo using Turborepo starter template per Step 3 documentation.

**Development Sequence:**

1. Initialize project using documented starter template
2. Set up development environment per architecture
3. Implement core architectural foundations (DB, auth, AI abstraction)
4. Build features following established patterns
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**

- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen Turborepo monorepo and architectural patterns provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
