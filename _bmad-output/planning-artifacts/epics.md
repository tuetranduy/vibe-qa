---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
workflowStatus: complete
completedAt: '2026-01-06'
---

# vibe-qa - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for vibe-qa, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Test Configuration & Execution:**
- FR1: Users can input a target URL for testing
- FR2: Users can provide natural language prompts to guide test focus (e.g., "test checkout flow")
- FR3: System provides suggested test prompts to guide users
- FR4: Users can initiate test execution for a configured URL and prompt
- FR5: System displays real-time progress during test discovery phase
- FR6: System displays real-time progress during test execution phase
- FR7: Users can view what functionalities the AI discovered before tests execute
- FR8: Users can manually add test scenarios to complement AI-generated tests
- FR9: Users can modify or remove AI-generated test scenarios before execution
- FR10: System executes tests asynchronously without blocking user interface
- FR43: Users can cancel in-progress test executions
- FR44: System displays clear error messages when URLs are invalid or unreachable
- FR53: Users can re-execute previous test configurations

**AI-Powered Test Generation:**
- FR11: System automatically discovers web application functionalities from a given URL
- FR12: System handles Single Page Application (SPA) architectures (React, Vue, Angular)
- FR13: System detects client-side routing and dynamic content loading
- FR14: System generates test scenarios based on discovered functionalities
- FR15: System assigns confidence scores to generated test scenarios
- FR16: System generates test scenarios that are contextually relevant to user prompts
- FR17: System captures screenshots during test execution as evidence
- FR51: System integrates with generative AI service for test generation capabilities

**Test Results & Reporting:**
- FR18: System generates comprehensive test reports after execution
- FR19: Reports include a complete list of functionalities discovered and tested
- FR20: Reports show pass/fail status for each test scenario
- FR21: Reports include bug findings with detailed descriptions
- FR22: Reports include step-by-step reproduction instructions for bugs
- FR23: Reports include screenshots showing bug evidence
- FR24: Reports display AI confidence scores for test scenarios
- FR25: Reports are formatted for developer consumption (clear, actionable)
- FR26: Users can export reports as PDF
- FR27: Users can generate shareable links for reports
- FR28: Users can view historical test reports
- FR29: Users can access previously captured screenshots (30-day retention)
- FR45: System notifies users when test execution completes
- FR46: Users can search/filter their test history
- FR54: Users can delete test reports from their history
- FR55: System provides public shareable links (no auth required for report viewing)

**User Account Management:**
- FR30: Users can create an account
- FR31: Users can log in to their account
- FR32: Users can log out of their account
- FR33: Users can manage their profile information
- FR34: System associates test runs with authenticated users
- FR35: System persists user test history across sessions
- FR47: System provides onboarding guidance for first-time users

**System Administration & Data Management:**
- FR36: System manages screenshot storage with 30-day retention policy
- FR37: System automatically deletes screenshots older than 30 days
- FR38: System queues test execution jobs for asynchronous processing
- FR39: System provides job status tracking for test executions
- FR40: System handles multiple concurrent test runs
- FR41: System stores test reports persistently in database
- FR42: System maintains test execution history per user
- FR48: System enforces rate limits on test execution requests per user
- FR49: System terminates test executions that exceed configurable timeout threshold
- FR50: System limits concurrent test executions per user (configurable limit)
- FR52: System maintains real-time bidirectional communication with client (WebSocket/SSE)

### Non-Functional Requirements

**AI Provider Integration:**
- NFR1: System must support multiple generative AI providers (OpenAI, Anthropic/Claude, Google/Gemini, local models like Ollama/LLaMA)
- NFR2: System defaults to configured AI provider but allows users to select preferred provider
- NFR3: AI provider authentication uses system-wide API keys with optional user override
- NFR4: AI integration layer must be provider-agnostic for seamless provider swapping
- NFR5: System must handle AI provider rate limits gracefully with retry and backoff strategies
- NFR6: System must implement fallback mechanisms if primary AI provider is unavailable
- NFR7: AI provider responses must be validated and sanitized before use
- NFR8: System must maintain provider-specific configuration (API keys, endpoints, model selections)
- NFR9: AI response timeout must be configurable (default: 60 seconds)

**Browser Automation Integration:**
- NFR10: System must use Playwright as browser automation engine
- NFR11: Playwright integration must support Chrome and Firefox browsers
- NFR12: Playwright version must be maintained following stable release cycle
- NFR13: System must handle Playwright browser lifecycle (launch, navigation, interaction, screenshot, cleanup)
- NFR14: Browser automation must support SPA-specific features (client-side routing, dynamic content, async operations)
- NFR15: System must capture and handle browser errors and timeouts gracefully

**API Integration Standards:**
- NFR16: All external service integrations must include timeout configurations
- NFR17: Failed external service calls must not crash the application
- NFR18: Integration failures must be logged with sufficient detail for debugging
- NFR19: System must support configurable retry policies for transient failures

**Security:**
- NFR20: User passwords must be hashed using industry-standard algorithms (bcrypt)
- NFR21: User sessions must be securely managed with appropriate timeout policies
- NFR22: System must protect against common web vulnerabilities (XSS, CSRF, SQL injection)
- NFR23: API endpoints must implement proper authentication and authorization checks
- NFR24: Test data and screenshots must be sanitized for PII or sensitive information
- NFR25: Screenshots must be accessible only to owning user or via authorized public links
- NFR26: Sensitive configuration data must be stored encrypted
- NFR27: System must implement secure data transmission (HTTPS)
- NFR28: Screenshot retention policy (30 days) must be automatically enforced

**Scalability:**
- NFR29: System must support configurable concurrent test execution limits per user (default: 3)
- NFR30: System must handle multiple concurrent users (initial target: 50 concurrent tests system-wide)
- NFR31: Job queue must scale to handle growing test execution demand
- NFR32: Database queries must be optimized for growth in test history and screenshots
- NFR33: System must implement rate limiting per user (default: 10 test runs/hour per user)
- NFR34: Screenshot storage must be monitored and managed to prevent unbounded growth
- NFR35: Architecture must support horizontal scaling for increased user load

**Reliability:**
- NFR36: System must handle AI provider unavailability gracefully without complete failure
- NFR37: Browser automation failures must be reported clearly without crashing
- NFR38: Test execution success rate target: 85% completion without infrastructure failures
- NFR39: AI quality baseline: 80% of generated tests must be executable and contextually relevant
- NFR40: AI confidence scores must meet minimum threshold of 70% for acceptable quality
- NFR41: Flaky tests (inconsistent results) must be detected and flagged
- NFR42: Test cancellation must cleanly terminate browser instances and jobs
- NFR43: Test reports must be persisted reliably before user confirmation
- NFR44: Screenshot capture failures must not prevent test execution completion

**Performance:**
- NFR45: UI page load times must be under 3 seconds for standard operations
- NFR46: Real-time updates must have latency under 500ms
- NFR47: Report generation and PDF export must complete within 10 seconds

**Monitoring & Observability:**
- NFR48: System must track AI provider performance metrics (response time, success rate, errors)
- NFR49: System must monitor job queue health (queue depth, processing time, failure rate)
- NFR50: System must monitor Playwright execution health (browser launch success, test failures)
- NFR51: System must track test execution statistics (completion, cancellation, timeout rates)
- NFR52: System must collect KPIs (active users, test runs/day, storage usage)
- NFR53: System must alert on critical failures (AI unavailability, DB connection loss, queue failures)
- NFR54: System must log all test executions with sufficient detail for debugging
- NFR55: Log retention: 90 days for application logs, permanent for security logs

**Operational:**
- NFR56: System must support containerized deployment (Docker)
- NFR57: System must be deployable to cloud infrastructure or self-hosted environments
- NFR58: System must support environment-based configuration (dev, staging, production)
- NFR59: Database migrations must be versioned and automated
- NFR60: User data must be backed up daily
- NFR61: System must support zero-downtime deployments
- NFR62: System must provide maintenance mode capability

### Additional Requirements

**Architecture Requirements:**
- ARCH1: **Turborepo Monorepo Structure** - Initialize monorepo with apps/ (web, api) and packages/ (shared-types, ai-client, test-engine, database)
- ARCH2: Shared TypeScript types between frontend and backend via shared-types package
- ARCH3: AI provider abstraction layer implemented in ai-client package supporting OpenAI, Anthropic, Google Gemini, and Ollama
- ARCH4: Playwright automation wrapped in test-engine package for reusable browser automation
- ARCH5: Prisma ORM for database with schema and migrations in database package
- ARCH6: MySQL 8+ as primary database with connection pooling
- ARCH7: Redis 7+ for BullMQ job queue and caching
- ARCH8: Node.js 18+ LTS for backend runtime
- ARCH9: React 18+ with Vite for frontend build
- ARCH10: Express.js 4+ for backend API framework
- ARCH11: WebSocket or SSE for real-time bidirectional communication
- ARCH12: JWT with bcrypt for authentication
- ARCH13: Zod for runtime validation with TypeScript types
- ARCH14: Docker Compose for local development infrastructure (MySQL, Redis)
- ARCH15: API response caching strategy using Redis for frequently accessed data
- ARCH16: Cache-aside pattern with TTL-based expiration and event-based invalidation
- ARCH17: RESTful API with versioning (/api/v1/...) and standardized response formats
- ARCH18: Swagger/OpenAPI 3.0 documentation at /api/v1/docs
- ARCH19: Rate limiting via express-rate-limit middleware
- ARCH20: Pagination support with query params (page, limit) and metadata responses

**UX Requirements:**
- UX1: Design system using shadcn/ui (Radix UI + Tailwind CSS) for consistent component library
- UX2: Natural language interface prioritizing QA-friendly language over technical jargon
- UX3: Real-time status updates with instantly recognizable test states (Queued, Discovering, Generating, Executing, Completed, Failed)
- UX4: TypeScript strict mode for full type safety matching project requirements
- UX5: Trust-building through clear feedback, progress indicators, and confidence scores
- UX6: Professional, shareable report presentation suitable for team consumption
- UX7: Error messages must be actionable and clear, never leaving users wondering what went wrong
- UX8: Interface must reduce uncertainty with clear labels, expected outcomes, and obvious next steps
- UX9: Design patterns must map directly to backend architecture for implementation consistency

### FR Coverage Map

**Test Configuration & Execution:**
- FR1: Epic 2 - Users can input a target URL for testing
- FR2: Epic 2 - Users can provide natural language prompts to guide test focus
- FR3: Epic 2 - System provides suggested test prompts to guide users
- FR4: Epic 2 - Users can initiate test execution for a configured URL and prompt
- FR5: Epic 4 - System displays real-time progress during test discovery phase
- FR6: Epic 4 - System displays real-time progress during test execution phase
- FR7: Epic 4 - Users can view what functionalities the AI discovered before tests execute
- FR8: Epic 4 - Users can manually add test scenarios to complement AI-generated tests
- FR9: Epic 4 - Users can modify or remove AI-generated test scenarios before execution
- FR10: Epic 4 - System executes tests asynchronously without blocking user interface
- FR43: Epic 4 - Users can cancel in-progress test executions
- FR44: Epic 4 - System displays clear error messages when URLs are invalid or unreachable
- FR53: Epic 4 - Users can re-execute previous test configurations

**AI-Powered Test Generation:**
- FR11: Epic 3 - System automatically discovers web application functionalities from a given URL
- FR12: Epic 3 - System handles Single Page Application (SPA) architectures (React, Vue, Angular)
- FR13: Epic 3 - System detects client-side routing and dynamic content loading
- FR14: Epic 3 - System generates test scenarios based on discovered functionalities
- FR15: Epic 3 - System assigns confidence scores to generated test scenarios
- FR16: Epic 3 - System generates test scenarios that are contextually relevant to user prompts
- FR17: Epic 4 - System captures screenshots during test execution as evidence
- FR51: Epic 3 - System integrates with generative AI service for test generation capabilities

**Test Results & Reporting:**
- FR18: Epic 5 - System generates comprehensive test reports after execution
- FR19: Epic 5 - Reports include a complete list of functionalities discovered and tested
- FR20: Epic 5 - Reports show pass/fail status for each test scenario
- FR21: Epic 5 - Reports include bug findings with detailed descriptions
- FR22: Epic 5 - Reports include step-by-step reproduction instructions for bugs
- FR23: Epic 5 - Reports include screenshots showing bug evidence
- FR24: Epic 5 - Reports display AI confidence scores for test scenarios
- FR25: Epic 5 - Reports are formatted for developer consumption (clear, actionable)
- FR26: Epic 5 - Users can export reports as PDF
- FR27: Epic 5 - Users can generate shareable links for reports
- FR28: Epic 5 - Users can view historical test reports
- FR29: Epic 5 - Users can access previously captured screenshots (30-day retention)
- FR45: Epic 5 - System notifies users when test execution completes
- FR46: Epic 5 - Users can search/filter their test history
- FR54: Epic 5 - Users can delete test reports from their history
- FR55: Epic 5 - System provides public shareable links (no auth required for report viewing)

**User Account Management:**
- FR30: Epic 1 - Users can create an account
- FR31: Epic 1 - Users can log in to their account
- FR32: Epic 1 - Users can log out of their account
- FR33: Epic 1 - Users can manage their profile information
- FR34: Epic 1 - System associates test runs with authenticated users
- FR35: Epic 1 - System persists user test history across sessions
- FR47: Epic 1 - System provides onboarding guidance for first-time users

**System Administration & Data Management:**
- FR36: Epic 6 - System manages screenshot storage with 30-day retention policy
- FR37: Epic 6 - System automatically deletes screenshots older than 30 days
- FR38: Epic 2 - System queues test execution jobs for asynchronous processing
- FR39: Epic 2 - System provides job status tracking for test executions
- FR40: Epic 4 - System handles multiple concurrent test runs
- FR41: Epic 5 - System stores test reports persistently in database
- FR42: Epic 5 - System maintains test execution history per user
- FR48: Epic 7 - System enforces rate limits on test execution requests per user
- FR49: Epic 7 - System terminates test executions that exceed configurable timeout threshold
- FR50: Epic 4 - System limits concurrent test executions per user (configurable limit)
- FR52: Epic 4 - System maintains real-time bidirectional communication with client (WebSocket/SSE)

## Epic List

### Epic 1: Project Foundation & Authentication
Users can create accounts, log in securely, manage their profiles, and receive onboarding guidance. The technical foundation (Turborepo monorepo, database, core infrastructure, shared packages) is established to enable all future features.

**FRs covered:** FR30, FR31, FR32, FR33, FR34, FR35, FR47  
**Architecture Requirements:** ARCH1-ARCH20 (Turborepo monorepo, MySQL, Redis, Prisma, shared-types, database package, JWT auth, API structure)  
**UX Requirements:** UX1 (shadcn/ui design system), UX4 (TypeScript strict mode)

### Epic 2: Test Configuration & Initiation
Users can input a target URL, write natural language test prompts with suggested guidance, and initiate test runs that queue for asynchronous execution with job status tracking.

**FRs covered:** FR1, FR2, FR3, FR4, FR38, FR39  
**UX Requirements:** UX2 (Natural language interface), UX7 (Actionable error messages), UX8 (Clear labels and next steps)

### Epic 3: AI-Powered Discovery & Test Generation
The system discovers web application functionalities using AI (supporting SPAs with client-side routing and dynamic content), generates contextually relevant test scenarios with confidence scores, and integrates with multiple AI providers (OpenAI, Anthropic, Google, Ollama).

**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR51  
**NFRs:** NFR1-NFR9 (Multi-provider AI integration, provider-agnostic abstraction, rate limiting, fallbacks, timeout handling)  
**Architecture Requirements:** ARCH3 (ai-client package with multi-provider support)

### Epic 4: Test Execution & Real-Time Progress
Users see real-time progress as tests execute via browser automation (Chrome/Firefox with Playwright), can review discovered functionalities before execution, manually modify test scenarios, capture screenshots, cancel in-progress runs, and handle concurrent test executions with clear error feedback.

**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR17, FR40, FR43, FR44, FR50, FR52, FR53  
**NFRs:** NFR10-NFR15 (Playwright browser automation, SPA support, error handling), NFR29, NFR30 (Concurrent execution limits), NFR42 (Clean cancellation)  
**Architecture Requirements:** ARCH4 (test-engine package), ARCH11 (WebSocket/SSE for real-time updates)  
**UX Requirements:** UX3 (Real-time status updates), UX5 (Trust-building feedback), UX9 (Design mapping to backend)

### Epic 5: Test Results & Comprehensive Reporting
Users receive comprehensive test reports showing pass/fail status, bug findings with screenshots and reproduction steps, AI confidence scores, and can export to PDF, generate shareable public links, search/filter test history, and delete reports.

**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR41, FR42, FR45, FR46, FR54, FR55  
**NFRs:** NFR43 (Report persistence), NFR44 (Screenshot capture resilience), NFR47 (Report generation performance)  
**UX Requirements:** UX6 (Professional, shareable reports)

### Epic 6: Screenshot Management & Data Lifecycle
System automatically manages screenshot storage with 30-day retention policy, handles PII sanitization, performs automatic cleanup of expired data, and monitors storage to prevent unbounded growth.

**FRs covered:** FR36, FR37  
**NFRs:** NFR24 (PII sanitization), NFR28 (Retention enforcement), NFR34 (Storage monitoring)

### Epic 7: System Resilience & Quality Assurance
System operates reliably with graceful degradation when AI providers or browser automation fails, implements fallback mechanisms, enforces AI quality baselines (70% confidence minimum, 80% executable tests), handles timeouts (60s AI default), implements rate limiting (10 runs/hour per user), and ensures 85% test execution success rate.

**FRs covered:** FR48, FR49, FR50  
**NFRs:** NFR5, NFR6 (AI fallbacks), NFR16-NFR19 (Integration standards), NFR36-NFR44 (Reliability targets, flaky test detection, clean failures)

### Epic 8: Monitoring, Observability & Operations
System operators can monitor health metrics (AI provider performance, job queue depth, Playwright execution), track KPIs (active users, test runs/day, storage usage), receive alerts on critical failures, manage zero-downtime deployments, perform automated backups, and access API documentation.

**NFRs:** NFR48-NFR62 (Monitoring metrics, alerting, logging with 90-day retention, Docker deployment, database migrations, backup/recovery, maintenance mode)  
**Architecture Requirements:** ARCH14 (Docker Compose), ARCH18 (Swagger/OpenAPI docs), ARCH19 (Rate limiting middleware), ARCH20 (Pagination support)

## Epic 1: Project Foundation & Authentication

Users can create accounts, log in securely, manage their profiles, and receive onboarding guidance. The technical foundation (Turborepo monorepo, database, core infrastructure, shared packages) is established to enable all future features.

### Story 1.1: Initialize Turborepo Monorepo Structure

As a **developer**,
I want **a fully configured Turborepo monorepo with apps and packages**,
So that **I can build features using shared types and consistent tooling**.

**Acceptance Criteria:**

**Given** I am setting up the vibe-qa project
**When** I initialize the repository
**Then** I should have a working Turborepo monorepo with:
- `apps/web` (React + Vite + TypeScript starter)
- `apps/api` (Express + TypeScript starter)
- `packages/shared-types` (empty TypeScript package ready for types)
- `packages/ai-client` (empty package structure)
- `packages/test-engine` (empty package structure)
- `packages/database` (empty package structure)
**And** `turbo.json` configured with build pipeline dependencies
**And** Root `package.json` with workspace configuration
**And** Base `tsconfig.json` for TypeScript settings
**And** `docker-compose.yml` with MySQL 8 and Redis 7 containers
**And** All packages can be built with `turbo run build`
**And** Dev mode starts both apps with `turbo run dev`

### Story 1.2: Set Up Database Schema and Prisma ORM

As a **developer**,
I want **Prisma configured with User table in the database package**,
So that **I can persist user account data for authentication**.

**Acceptance Criteria:**

**Given** the monorepo structure exists
**When** I set up the database package
**Then** I should have:
- Prisma installed in `packages/database`
- `schema.prisma` with datasource pointing to MySQL
- User model with fields: id, email, password, name, createdAt, updatedAt
- Migration generated and applied to local MySQL
- Prisma Client generated and exported from package
**And** `apps/api` can import `@vibe-qa/database` and access Prisma Client
**And** Database connection works when API starts

### Story 1.3: Implement User Registration API

As a **new user**,
I want **to create an account with email and password**,
So that **I can access the vibe-qa platform**.

**Acceptance Criteria:**

**Given** I am a new user
**When** I POST to `/api/v1/auth/signup` with email, password, and name
**Then** my password should be hashed with bcrypt (cost factor 12)
**And** a new User record should be created in the database
**And** I should receive a 201 response with my user profile (without password)
**And** duplicate email should return 400 error: "Email already registered"
**And** invalid email format should return 400 error with validation details
**And** password must meet requirements (8+ chars, uppercase, lowercase, number, special char) validated by Zod
**And** weak passwords should return 400 error with specific requirements

### Story 1.4: Implement User Login with JWT

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my test history and create new tests**.

**Acceptance Criteria:**

**Given** I have a registered account
**When** I POST to `/api/v1/auth/login` with correct email and password
**Then** the system should verify my password against the hashed version
**And** I should receive a JWT token (HS256 signed, 7-day expiration)
**And** JWT payload should include userId and email
**And** I should receive 200 response with token and user profile
**And** incorrect password should return 401 error: "Invalid credentials"
**And** non-existent email should return 401 error: "Invalid credentials" (no user enumeration)
**And** JWT secret should be loaded from environment variable

### Story 1.5: Implement JWT Authentication Middleware

As a **developer**,
I want **reusable middleware to protect API routes with JWT**,
So that **only authenticated users can access protected endpoints**.

**Acceptance Criteria:**

**Given** I have API endpoints that require authentication
**When** a request includes `Authorization: Bearer <token>` header
**Then** the middleware should verify the JWT signature and expiration
**And** extract userId from JWT payload and attach to `req.user`
**And** allow the request to proceed to the route handler
**And** missing token should return 401 error: "Authentication required"
**And** invalid token signature should return 401 error: "Invalid token"
**And** expired token should return 401 error: "Token expired"
**And** malformed token should return 401 error: "Invalid token format"

### Story 1.6: Implement User Profile Management

As an **authenticated user**,
I want **to view and update my profile information**,
So that **I can keep my account details current**.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I GET `/api/v1/users/me`
**Then** I should receive my user profile (id, email, name, createdAt) without password
**And** requests without authentication should return 401 error

**Given** I am authenticated
**When** I PATCH `/api/v1/users/me` with updated name
**Then** my User record should be updated in the database
**And** I should receive 200 response with updated profile
**And** email field should not be updatable (return 400 if attempted)
**And** other users' attempts to update my profile should fail with 403 error

### Story 1.7: Implement User Logout

As an **authenticated user**,
I want **to log out of my account**,
So that **my session is ended securely**.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I POST to `/api/v1/auth/logout`
**Then** I should receive 200 response confirming logout
**And** frontend should clear the stored JWT token (stateless JWT, server-side no action needed in MVP)
**And** subsequent requests with the old token should still be rejected (client responsibility to discard)

### Story 1.8: Implement Basic Frontend Authentication UI

As a **new or returning user**,
I want **signup and login forms with shadcn/ui components**,
So that **I can create an account or access my existing account**.

**Acceptance Criteria:**

**Given** I visit the vibe-qa web app
**When** I navigate to the signup page
**Then** I should see a form with email, password, name fields using shadcn/ui Form components
**And** password requirements should be displayed clearly
**And** form validation should show errors before submission
**And** successful signup should store JWT in localStorage and redirect to dashboard
**And** API errors should display user-friendly messages

**When** I navigate to the login page
**Then** I should see a form with email and password fields
**And** successful login should store JWT and redirect to dashboard
**And** "Forgot password?" link should be visible (non-functional in MVP per FR33)
**And** failed login should show error: "Invalid email or password"

### Story 1.9: Implement Protected Routes and Navigation

As an **authenticated user**,
I want **protected routes and navigation with logout capability**,
So that **I can access the dashboard and log out when needed**.

**Acceptance Criteria:**

**Given** I am not authenticated
**When** I try to access `/dashboard` or other protected routes
**Then** I should be redirected to `/login`

**Given** I am authenticated
**When** I access `/dashboard`
**Then** I should see the main application interface
**And** navigation should display my name and logout button
**And** clicking logout should clear JWT and redirect to login page

**Given** I am authenticated
**When** I refresh the page
**Then** my authentication state should persist (JWT from localStorage)
**And** invalid/expired JWT should redirect to login

## Epic 2: Test Configuration & Initiation

Users can input a target URL, write natural language test prompts with suggested guidance, and initiate test runs that queue for asynchronous execution with job status tracking.

### Story 2.1: Create Test Run Database Schema

As a **developer**,
I want **database tables for test runs and job queue metadata**,
So that **I can persist test configurations and track execution status**.

**Acceptance Criteria:**

**Given** the database package exists
**When** I create a new Prisma migration
**Then** I should have TestRun model with fields:
- id, userId (foreign key to User), url, prompt, status, createdAt, updatedAt
- status enum: QUEUED, DISCOVERING, GENERATING, EXECUTING, COMPLETED, FAILED, CANCELLED
**And** TestRun has relation to User (one user has many test runs)
**And** Migration is generated and applied successfully
**And** Prisma Client is regenerated with new TestRun model
**And** API can import and use TestRun model from `@vibe-qa/database`

### Story 2.2: Set Up BullMQ Job Queue with Redis

As a **developer**,
I want **BullMQ configured with Redis for asynchronous test execution**,
So that **test runs don't block the API and can be processed in the background**.

**Acceptance Criteria:**

**Given** Redis is running via docker-compose
**When** I configure BullMQ in `apps/api`
**Then** I should have:
- BullMQ installed with Redis connection configuration
- Test execution queue created named "test-execution"
- Queue connection verified on API startup
- Basic job producer function to add jobs to queue
- Basic job consumer (worker) structure ready (no processing logic yet)
**And** API logs confirm successful queue connection
**And** Redis connection failures are handled gracefully with error logging

### Story 2.3: Implement Test Run Creation API with Suggested Prompts

As an **authenticated user**,
I want **to create a test run with URL and natural language prompt**,
So that **I can initiate testing of any web application**.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I POST to `/api/v1/test-runs` with url and prompt
**Then** the URL should be validated (valid HTTP/HTTPS format) by Zod
**And** prompt should be validated (1-500 characters)
**And** a new TestRun record should be created with status QUEUED and my userId
**And** a job should be added to the BullMQ queue with testRunId
**And** I should receive 201 response with test run details (id, url, prompt, status, createdAt)
**And** invalid URL should return 400 error with clear message
**And** empty prompt should return 400 error: "Prompt is required"
**And** unauthenticated requests should return 401 error

**Given** I GET `/api/v1/test-runs/suggested-prompts`
**Then** I should receive a list of suggested test prompts:
- "Test the checkout and payment flow"
- "Test user registration and login"
- "Test search and filtering functionality"
- "Test form validation and error handling"
- "Test responsive design and mobile experience"
**And** these suggestions help guide users on what prompts to provide (FR3)

### Story 2.4: Implement Job Status Tracking API

As an **authenticated user**,
I want **to check the status of my test runs**,
So that **I know when my tests are queued, running, or completed**.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I GET `/api/v1/test-runs/:id`
**Then** I should receive the test run details including current status
**And** test run must belong to my userId (return 404 if not mine)
**And** response should include: id, url, prompt, status, createdAt, updatedAt
**And** non-existent test run should return 404 error

**Given** I am authenticated
**When** I GET `/api/v1/test-runs` (list my test runs)
**Then** I should receive paginated list of my test runs (default: 20 per page)
**And** results should be sorted by createdAt descending (newest first)
**And** pagination metadata should be included (page, limit, total, totalPages)
**And** query params `?page=2&limit=10` should control pagination
**And** only my test runs should be returned (filtered by userId)

### Story 2.5: Implement Test Configuration UI

As an **authenticated user**,
I want **a form to input URL and prompt with suggested prompts**,
So that **I can easily configure and start a new test run**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I access the "New Test" page or section
**Then** I should see a form with:
- URL input field with placeholder "https://example.com"
- Prompt textarea with placeholder "Describe what you want to test..."
- "Suggested Prompts" dropdown or list showing 5 common prompts (from API)
- "Start Test" button
**And** clicking a suggested prompt should populate the prompt field
**And** form validation should show errors before submission
**And** URL validation should check for valid HTTP/HTTPS format
**And** prompt validation should require 1-500 characters

**Given** I submit the form with valid URL and prompt
**When** I click "Start Test"
**Then** a POST request should be made to `/api/v1/test-runs`
**And** on success, I should be redirected to test run detail page
**And** on API error, I should see user-friendly error message
**And** button should show loading state during submission

### Story 2.6: Implement Test Run List and Detail Views

As an **authenticated user**,
I want **to view my list of test runs and see individual test run details**,
So that **I can track my testing history and access specific test results**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I view my test runs list
**Then** I should see a table/list of my test runs with:
- URL tested
- Prompt used
- Status badge (color-coded: QUEUED=gray, DISCOVERING=blue, EXECUTING=yellow, COMPLETED=green, FAILED=red, CANCELLED=orange)
- Created date/time
- Link to view details
**And** list should be paginated with "Load More" or pagination controls
**And** newest test runs should appear first

**Given** I click on a test run
**When** I view the test run detail page
**Then** I should see:
- Full URL
- Full prompt
- Current status with last updated time
- Creation timestamp
- Status-appropriate messaging (e.g., "Queued for execution", "Discovering functionalities...")
**And** if status is QUEUED or DISCOVERING or EXECUTING, show "Cancel Test" button (non-functional in this story)
**And** if status is COMPLETED, show link to "View Report" (non-functional until Epic 5)
**And** if status is FAILED, show error message explaining what went wrong

## Epic 3: AI-Powered Discovery & Test Generation

The system discovers web application functionalities using AI (supporting SPAs with client-side routing and dynamic content), generates contextually relevant test scenarios with confidence scores, and integrates with multiple AI providers (OpenAI, Anthropic, Google, Ollama).

### Story 3.1: Create AI Client Package Structure with Provider Abstraction

As a **developer**,
I want **an ai-client package with provider-agnostic interface**,
So that **I can integrate multiple AI providers without coupling to specific SDKs**.

**Acceptance Criteria:**

**Given** the packages/ai-client exists
**When** I set up the package structure
**Then** I should have:
- TypeScript interface `AIProvider` with methods: `generateTestScenarios(url, prompt, discoveredFunctionalities)`
- Base abstract class or interface defining standard AI operations
- Configuration interface for provider settings (apiKey, model, timeout)
- Response normalization interface: `AITestScenario` with fields: description, steps, confidenceScore, reasoning
**And** Package exports clean public API for use by apps/api
**And** Package can be imported as `@vibe-qa/ai-client`

### Story 3.2: Implement OpenAI Provider Integration

As a **developer**,
I want **OpenAI integration in the ai-client package**,
So that **the system can use OpenAI models for test generation**.

**Acceptance Criteria:**

**Given** the ai-client package structure exists
**When** I implement OpenAI provider
**Then** I should have:
- OpenAI SDK installed and configured
- `OpenAIProvider` class implementing `AIProvider` interface
- Connection to OpenAI API with API key from environment variable
- `generateTestScenarios()` method that sends prompt with context to GPT-4 or configured model
- Response parsing that normalizes OpenAI completion format to `AITestScenario[]`
- Confidence score extraction or calculation (0-100)
- Error handling for API failures, rate limits, timeouts
**And** timeout default set to 60 seconds (configurable via NFR9)
**And** OpenAI-specific errors are normalized to standard error format

### Story 3.3: Implement Anthropic Claude Provider Integration

As a **developer**,
I want **Anthropic Claude integration in the ai-client package**,
So that **users can choose Claude as their AI provider**.

**Acceptance Criteria:**

**Given** the ai-client package structure exists
**When** I implement Anthropic provider
**Then** I should have:
- Anthropic SDK installed and configured
- `AnthropicProvider` class implementing `AIProvider` interface
- Connection to Anthropic API with API key from environment variable
- `generateTestScenarios()` method using Claude model (claude-3-sonnet or configured)
- Response parsing that normalizes Anthropic message format to `AITestScenario[]`
- Confidence score extraction or calculation
- Error handling for Anthropic-specific API failures
**And** timeout set to 60 seconds (configurable)
**And** Anthropic rate limit handling with appropriate retry logic

### Story 3.4: Implement AI Provider Factory with Fallback Logic

As a **developer**,
I want **a factory to select and instantiate AI providers with fallback support**,
So that **the system can gracefully handle provider failures**.

**Acceptance Criteria:**

**Given** multiple AI providers are implemented
**When** I create AIProviderFactory
**Then** I should have:
- Factory function that returns appropriate provider based on configuration
- Environment variable `AI_PROVIDER` to set primary provider (default: "openai")
- Optional `AI_FALLBACK_PROVIDER` environment variable
- Provider initialization with validation (check API keys exist)
- Fallback logic: if primary provider fails, try fallback provider
- Error aggregation if all providers fail
**And** factory logs which provider is being used
**And** missing API keys log clear error messages
**And** unsupported provider names throw configuration error

### Story 3.5: Create Discovered Functionalities Database Schema

As a **developer**,
I want **database schema for discovered web functionalities**,
So that **I can persist what the AI discovered before test generation**.

**Acceptance Criteria:**

**Given** the database package exists
**When** I create a new Prisma migration
**Then** I should have DiscoveredFunctionality model with fields:
- id, testRunId (foreign key to TestRun), name, description, url, createdAt
**And** DiscoveredFunctionality has relation to TestRun (one test run has many discovered functionalities)
**And** Migration is generated and applied successfully
**And** Prisma Client regenerated with new model

### Story 3.6: Implement Web Scraping and SPA Discovery Logic

As a **developer**,
I want **Playwright-based web scraping that discovers SPA functionalities**,
So that **the system can understand what features exist on the target URL**.

**Acceptance Criteria:**

**Given** packages/test-engine exists
**When** I implement discovery function `discoverFunctionalities(url)`
**Then** I should have:
- Playwright browser launch and page navigation to target URL
- Wait for network idle and DOM stability (SPA detection)
- Extraction of: page title, main headings, links, buttons, forms, input fields
- Detection of client-side routing patterns (React Router, Vue Router, Angular)
- Detection of dynamic content loading (AJAX calls, lazy loading)
- Return structured data: list of discovered UI elements and their purposes
**And** browser cleanup in finally block (prevent memory leaks)
**And** timeout handling (fail gracefully if page doesn't load in 30 seconds)
**And** error handling for unreachable URLs with clear error message

### Story 3.7: Implement Test Scenario Generation Worker Logic

As a **developer**,
I want **BullMQ worker that processes test generation jobs**,
So that **test runs execute asynchronously using AI to generate scenarios**.

**Acceptance Criteria:**

**Given** BullMQ queue and AI providers are configured
**When** a job is picked up from the "test-execution" queue
**Then** the worker should:
1. Update TestRun status to DISCOVERING
2. Call `discoverFunctionalities(url)` from test-engine package
3. Save discovered functionalities to DiscoveredFunctionality table
4. Update TestRun status to GENERATING
5. Call AI provider's `generateTestScenarios(url, prompt, discoveredFunctionalities)`
6. Normalize AI response to standard format with confidence scores
7. Filter scenarios with confidence < 70% (mark as low confidence per NFR40)
8. Save generated scenarios (will create schema in Epic 4)
9. Update TestRun status to QUEUED_FOR_EXECUTION (ready for Epic 4)
**And** handle errors at each step with clear logging
**And** on failure, update TestRun status to FAILED with error message
**And** AI timeout (60s) should be enforced
**And** if primary AI provider fails, attempt fallback provider
**And** log which provider was used for each test run

### Story 3.8: Display Discovered Functionalities in UI

As an **authenticated user**,
I want **to see what functionalities the AI discovered on my target URL**,
So that **I can understand what the system detected before tests are generated**.

**Acceptance Criteria:**

**Given** my test run is in DISCOVERING or later status
**When** I view the test run detail page
**Then** I should see a "Discovered Functionalities" section with:
- List of discovered UI elements (buttons, forms, links, pages)
- Description of each functionality
- Count of total functionalities discovered
**And** section should be hidden if status is still QUEUED
**And** while status is DISCOVERING, show loading indicator: "Analyzing your application..."
**And** if discovery failed, show error message: "Could not analyze URL. Please check the URL and try again."

## Epic 4: Test Execution & Real-Time Progress

Users see real-time progress as tests execute via browser automation (Chrome/Firefox with Playwright), can review discovered functionalities before execution, manually modify test scenarios, capture screenshots, cancel in-progress runs, and handle concurrent test executions with clear error feedback.

### Story 4.1: Create Test Scenarios Database Schema

As a **developer**,
I want **database schema for generated test scenarios and execution results**,
So that **I can persist AI-generated tests and their execution outcomes**.

**Acceptance Criteria:**

**Given** the database package exists
**When** I create a new Prisma migration
**Then** I should have TestScenario model with fields:
- id, testRunId (foreign key), description, steps (JSON), confidenceScore, status, result, errorMessage, executedAt, createdAt, updatedAt
- status enum: PENDING, EXECUTING, PASSED, FAILED, SKIPPED
**And** TestScenario has relation to TestRun (one test run has many scenarios)
**And** Migration is generated and applied successfully

### Story 4.2: Implement WebSocket Server for Real-Time Updates

As a **developer**,
I want **WebSocket server integrated into the API**,
So that **clients receive real-time progress updates during test execution**.

**Acceptance Criteria:**

**Given** apps/api exists
**When** I add Socket.io to the API
**Then** I should have:
- Socket.io server attached to Express HTTP server
- CORS configured to allow frontend origin
- Authentication middleware that verifies JWT from socket handshake
- Room/channel pattern: clients join room `test-run:{testRunId}`
- Helper functions to emit events: `emitTestRunUpdate(testRunId, data)`
**And** WebSocket connection logs successful auth or rejection
**And** clients can connect and authenticate with JWT token
**And** unauthorized connections are rejected with clear error

### Story 4.3: Implement Test Scenario Review and Modification API

As an **authenticated user**,
I want **to view, modify, and approve AI-generated test scenarios before execution**,
So that **I can ensure tests match my intentions**.

**Acceptance Criteria:**

**Given** my test run has status QUEUED_FOR_EXECUTION (scenarios generated)
**When** I GET `/api/v1/test-runs/:id/scenarios`
**Then** I should receive list of all generated test scenarios with:
- id, description, steps, confidenceScore, status
**And** only my test runs should be accessible (404 if not mine)

**When** I PATCH `/api/v1/test-runs/:id/scenarios/:scenarioId` with updated description or steps
**Then** the test scenario should be updated in the database
**And** I should receive 200 response with updated scenario
**And** only PENDING scenarios can be modified (400 error if already executed)

**When** I POST `/api/v1/test-runs/:id/scenarios` with new scenario
**Then** a new TestScenario should be created with status PENDING
**And** I should receive 201 response with created scenario

**When** I DELETE `/api/v1/test-runs/:id/scenarios/:scenarioId`
**Then** the scenario status should be set to SKIPPED
**And** I should receive 204 response

### Story 4.4: Implement Playwright Test Execution Engine

As a **developer**,
I want **test execution logic using Playwright in the test-engine package**,
So that **I can run AI-generated test scenarios against target URLs**.

**Acceptance Criteria:**

**Given** packages/test-engine exists
**When** I implement `executeTestScenario(url, scenario)`
**Then** I should have:
- Playwright browser launch (Chrome by default, Firefox configurable)
- Page navigation to URL
- Step-by-step execution of scenario.steps (click, type, navigate, wait, assert)
- Screenshot capture at each step or on failure
- Assertion handling (pass/fail detection)
- Return execution result: { status: 'PASSED' | 'FAILED', errorMessage?, screenshots: [...] }
**And** browser cleanup in finally block
**And** timeout per scenario (configurable, default 120 seconds)
**And** handle dynamic content and SPA navigation (wait for network idle)
**And** error handling for element not found, timeout, navigation failure

### Story 4.5: Implement Screenshot Storage Schema and Service

As a **developer**,
I want **database schema and file storage for screenshots**,
So that **I can persist visual evidence from test execution**.

**Acceptance Criteria:**

**Given** the database package exists
**When** I create a new Prisma migration
**Then** I should have Screenshot model with fields:
- id, testScenarioId (foreign key), testRunId (foreign key), filePath, capturedAt, expiresAt (30 days from capture)
**And** Screenshot has relations to TestScenario and TestRun
**And** Migration is generated and applied

**Given** test execution captures screenshots
**When** I implement screenshot storage service
**Then** I should have:
- Function to save screenshot buffer to filesystem (e.g., `uploads/screenshots/{testRunId}/{timestamp}.png`)
- Create Screenshot record in database with filePath and expiresAt
- Function to retrieve screenshot by ID
- Environment variable for storage path (default: `./uploads/screenshots`)
**And** storage directory is created if it doesn't exist
**And** filenames include testRunId and timestamp for organization

### Story 4.6: Implement Test Execution Worker with Concurrency Control

As a **developer**,
I want **BullMQ worker that executes test scenarios with concurrency limits**,
So that **tests run asynchronously without overwhelming system resources**.

**Acceptance Criteria:**

**Given** test scenarios are generated for a test run
**When** worker picks up execution job
**Then** worker should:
1. Check concurrent execution limit (3 per user, 50 system-wide per NFR29, NFR30)
2. If limit reached, delay job and requeue
3. Update TestRun status to EXECUTING
4. For each PENDING test scenario:
   a. Update scenario status to EXECUTING
   b. Emit WebSocket event: `test-scenario-started`
   c. Call `executeTestScenario()` from test-engine
   d. Save screenshots to storage and create Screenshot records
   e. Update scenario status to PASSED or FAILED with result
   f. Emit WebSocket event: `test-scenario-completed`
5. After all scenarios, update TestRun status to COMPLETED
6. Emit WebSocket event: `test-run-completed`
**And** handle errors with status FAILED and error message
**And** browser cleanup after each scenario
**And** log execution progress for debugging

### Story 4.7: Implement Test Cancellation

As an **authenticated user**,
I want **to cancel in-progress test executions**,
So that **I can stop tests that are taking too long or were started by mistake**.

**Acceptance Criteria:**

**Given** my test run has status DISCOVERING, GENERATING, or EXECUTING
**When** I POST to `/api/v1/test-runs/:id/cancel`
**Then** the system should:
- Update TestRun status to CANCELLED
- Signal BullMQ job to terminate (using job.remove() or similar)
- Terminate any active Playwright browser instances for this test run
- Update any EXECUTING scenarios to SKIPPED
- Emit WebSocket event: `test-run-cancelled`
**And** I should receive 200 response: "Test run cancelled"
**And** cannot cancel if status is COMPLETED, FAILED, or CANCELLED (400 error)
**And** only my test runs can be cancelled (404 if not mine)

**Given** the worker is executing tests
**When** cancellation is triggered
**Then** worker should:
- Detect cancellation signal
- Stop executing remaining scenarios
- Clean up browser instances
- Complete gracefully without errors

### Story 4.8: Implement Real-Time Progress UI with WebSocket

As an **authenticated user**,
I want **real-time updates on test execution progress**,
So that **I can see what's happening without refreshing the page**.

**Acceptance Criteria:**

**Given** I am viewing a test run detail page
**When** the test run status changes (QUEUED → DISCOVERING → GENERATING → EXECUTING → COMPLETED)
**Then** the UI should update automatically via WebSocket connection
**And** status badge should change color and text
**And** progress messages should update (e.g., "Discovering functionalities...", "Generating test scenarios...", "Executing tests...")

**Given** test scenarios are executing
**When** each scenario starts
**Then** I should see: "Running: {scenario description}" with loading spinner
**And** list of scenarios should show which one is currently executing

**When** each scenario completes
**Then** I should see updated status: PASSED (green check) or FAILED (red X)
**And** failed scenarios should show brief error message
**And** overall progress indicator (e.g., "5/10 tests completed")

**Given** test run completes
**When** all scenarios finish
**Then** I should see completion notification: "All tests completed! View your report."
**And** "View Report" button should become active

### Story 4.9: Implement Test Scenario Review UI

As an **authenticated user**,
I want **to review and modify generated test scenarios before execution**,
So that **I can customize tests to match my specific needs**.

**Acceptance Criteria:**

**Given** my test run has generated scenarios (status QUEUED_FOR_EXECUTION)
**When** I view the test run detail page
**Then** I should see "Review Test Scenarios" section with:
- List of all generated scenarios
- Each scenario shows: description, confidence score, expandable steps
- Low confidence scenarios (< 70%) highlighted with warning badge
- Edit button for each scenario
- Add New Scenario button
- Delete/Skip button for each scenario
- "Start Execution" button to begin tests

**When** I click Edit on a scenario
**Then** I should see modal/form with editable description and steps
**And** save updates via PATCH API
**And** updated scenario reflects changes immediately

**When** I click Add New Scenario
**Then** I should see form to create custom test with description and steps
**And** save creates new scenario via POST API

**When** I click Delete/Skip
**Then** scenario is marked SKIPPED and grayed out

**When** I click "Start Execution"
**Then** job should be updated to trigger execution phase
**And** UI transitions to real-time execution view

## Epic 5: Test Results & Comprehensive Reporting

Users receive comprehensive test reports showing pass/fail status, bug findings with screenshots and reproduction steps, AI confidence scores, and can export to PDF, generate shareable public links, search/filter test history, and delete reports.

### Story 5.1: Create Test Report Database Schema

As a **developer**,
I want **database schema for test reports with shareable tokens**,
So that **I can persist comprehensive test results and enable public sharing**.

**Acceptance Criteria:**

**Given** the database package exists
**When** I create a new Prisma migration
**Then** I should have Report model with fields:
- id, testRunId (foreign key, unique), userId, summary, passCount, failCount, totalCount, shareToken (unique, nullable), createdAt, updatedAt
**And** Report has relation to TestRun (one-to-one)
**And** Migration is generated and applied successfully

### Story 5.2: Implement Report Generation Logic

As a **developer**,
I want **automated report generation after test completion**,
So that **users receive comprehensive summaries of their test results**.

**Acceptance Criteria:**

**Given** a test run completes (status COMPLETED)
**When** worker finishes executing all scenarios
**Then** the system should:
- Aggregate results: count PASSED, FAILED, SKIPPED scenarios
- Generate summary text describing overall results
- Create Report record with testRunId, userId, aggregated data
- Update TestRun with reportId
- Emit WebSocket event: `report-ready`
**And** report includes:
- List of discovered functionalities
- List of test scenarios with status, confidence scores
- Pass/fail statistics
- Bug findings (failed scenarios with error messages)
- Reproduction steps (scenario steps that led to failure)
- Screenshots for failed scenarios
**And** report persists reliably before confirmation (NFR43)

### Story 5.3: Implement Report Viewing API

As an **authenticated user**,
I want **to view my test report with all details**,
So that **I can review findings and share results with my team**.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I GET `/api/v1/reports/:id`
**Then** I should receive complete report data:
- Report summary and statistics
- Discovered functionalities list
- Test scenarios with results
- Bug findings with descriptions
- Screenshots associated with each scenario
**And** report must belong to my userId (return 404 if not mine)
**And** non-existent report returns 404 error

**Given** I GET `/api/v1/test-runs/:id/report`
**Then** I should receive the report associated with that test run
**And** test run must belong to my userId

### Story 5.4: Implement Report Sharing with Public Links

As an **authenticated user**,
I want **to generate shareable public links for my reports**,
So that **I can share results with team members without requiring them to sign up**.

**Acceptance Criteria:**

**Given** I am authenticated and own a report
**When** I POST to `/api/v1/reports/:id/share`
**Then** the system should:
- Generate unique shareToken (UUID)
- Update Report record with shareToken
- Return shareable URL: `https://app.com/reports/share/{shareToken}`
**And** I should receive 200 response with shareToken and full URL

**Given** anyone (unauthenticated)
**When** they GET `/api/v1/reports/share/:shareToken`
**Then** they should receive the complete report data without authentication
**And** invalid shareToken returns 404 error: "Report not found or not shared"

**Given** I am authenticated and own a report with shareToken
**When** I DELETE `/api/v1/reports/:id/share`
**Then** the shareToken should be set to null (revoke public access)
**And** subsequent attempts to access via shareToken return 404

### Story 5.5: Implement PDF Report Export

As an **authenticated user**,
I want **to export my reports as PDF**,
So that **I can save or distribute results in a standard format**.

**Acceptance Criteria:**

**Given** I am authenticated and own a report
**When** I GET `/api/v1/reports/:id/export?format=pdf`
**Then** the system should:
- Generate PDF document with report content (title, summary, statistics, scenarios, screenshots)
- Format PDF professionally with clear sections and styling
- Return PDF file as download (Content-Type: application/pdf, Content-Disposition: attachment)
**And** PDF generation completes within 10 seconds (NFR47)
**And** report must belong to my userId (404 if not mine)

**Given** PDF generation fails
**When** there's an error creating the PDF
**Then** I should receive 500 error: "Failed to generate PDF export"
**And** error should be logged for debugging

### Story 5.6: Implement Screenshot Retrieval API

As an **authenticated user**,
I want **to view screenshots captured during test execution**,
So that **I can see visual evidence of bugs and test states**.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I GET `/api/v1/screenshots/:id`
**Then** I should receive the screenshot image file (Content-Type: image/png)
**And** screenshot must belong to one of my test runs (404 if not mine)
**And** expired screenshots (> 30 days) return 404 error: "Screenshot no longer available"
**And** non-existent screenshot ID returns 404 error

**Given** anyone accesses a public shared report
**When** they GET `/api/v1/screenshots/:id?shareToken={token}`
**Then** they should receive screenshot if it belongs to the shared report
**And** invalid shareToken or mismatched report returns 403 error

### Story 5.7: Implement Test History Search and Filtering

As an **authenticated user**,
I want **to search and filter my test history**,
So that **I can quickly find specific test runs or reports**.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I GET `/api/v1/test-runs?search={query}`
**Then** I should receive filtered list of test runs matching query in URL or prompt
**And** search is case-insensitive
**And** results include pagination metadata

**When** I GET `/api/v1/test-runs?status={status}`
**Then** I should receive test runs filtered by status (COMPLETED, FAILED, CANCELLED, etc.)

**When** I GET `/api/v1/test-runs?startDate={date}&endDate={date}`
**Then** I should receive test runs created within the date range

**When** I combine filters `/api/v1/test-runs?status=COMPLETED&search=checkout`
**Then** filters should be ANDed together

### Story 5.8: Implement Report Deletion

As an **authenticated user**,
I want **to delete my test reports and associated data**,
So that **I can manage my storage and remove unwanted test results**.

**Acceptance Criteria:**

**Given** I am authenticated and own a report
**When** I DELETE `/api/v1/reports/:id`
**Then** the system should:
- Delete Report record
- Delete all associated TestScenario records
- Delete all associated DiscoveredFunctionality records
- Delete all associated Screenshot records
- Delete screenshot files from filesystem
- Delete TestRun record
**And** I should receive 204 response (no content)
**And** can only delete my own reports (404 if not mine)

**Given** I am authenticated
**When** I DELETE `/api/v1/test-runs/:id` (alternate endpoint)
**Then** same deletion logic applies (cascade delete)

### Story 5.9: Implement Report Display UI

As an **authenticated user**,
I want **professionally formatted report display in the UI**,
So that **I can review test results in a clear, actionable format**.

**Acceptance Criteria:**

**Given** my test run has completed
**When** I click "View Report" on test run detail page
**Then** I should see report page with sections:
- **Executive Summary**: Total tests, pass/fail counts, overall success rate
- **Discovered Functionalities**: List of what AI found on the site
- **Test Results**: Table of scenarios with status, confidence score, expand to see steps
- **Bug Findings**: Highlighted failed scenarios with:
  - Bug description
  - Reproduction steps (numbered list)
  - Screenshots showing the failure
  - Confidence score
- **Share Options**: Button to generate shareable link
- **Export Options**: Button to download PDF

**Given** a failed test scenario
**When** I expand it in Bug Findings
**Then** I should see:
- Clear error message
- Step-by-step reproduction instructions
- Thumbnails of screenshots (click to enlarge)
- Timestamp of execution

**Given** I click "Share Report"
**When** shareable link is generated
**Then** I should see success message with copyable link
**And** "Revoke Access" button to disable sharing

**Given** I click "Export PDF"
**When** PDF is generating
**Then** button shows loading state
**And** PDF downloads automatically when ready

## Epic 6: Screenshot Management & Data Lifecycle

System automatically manages screenshot storage with 30-day retention policy, handles PII sanitization, performs automatic cleanup of expired data, and monitors storage to prevent unbounded growth.

### Story 6.1: Implement Screenshot Expiration Cron Job

As a **system administrator**,
I want **automated cleanup of expired screenshots**,
So that **storage doesn't grow unbounded and 30-day retention is enforced**.

**Acceptance Criteria:**

**Given** the API has scheduled jobs capability
**When** I implement screenshot cleanup cron job
**Then** the job should:
- Run daily at midnight (configurable schedule)
- Query Screenshot table for records where `expiresAt < NOW()`
- Delete screenshot files from filesystem
- Delete Screenshot records from database
- Log count of deleted screenshots
**And** job runs reliably without manual intervention
**And** failed deletions are logged but don't crash the job
**And** successful cleanup logs: "Deleted X expired screenshots"

### Story 6.2: Implement PII Detection and Sanitization

As a **developer**,
I want **basic PII detection in screenshots**,
So that **we reduce the risk of storing sensitive user information**.

**Acceptance Criteria:**

**Given** screenshot is captured during test execution
**When** I implement PII sanitization check
**Then** the system should:
- Scan screenshot for common PII patterns using OCR or metadata (optional MVP feature)
- Log warning if potential PII detected: "Potential PII detected in screenshot {id}"
- Allow screenshot storage but flag for review
**And** sanitization doesn't block test execution (NFR44)
**And** if sanitization fails, screenshot is still saved (graceful degradation)

**Note:** Full PII redaction is post-MVP; MVP focuses on detection and logging.

### Story 6.3: Implement Storage Monitoring and Alerts

As a **system administrator**,
I want **monitoring of screenshot storage usage**,
So that **I'm alerted before storage limits are reached**.

**Acceptance Criteria:**

**Given** screenshots are being stored
**When** I implement storage monitoring
**Then** the system should:
- Track total storage size used by screenshots (query filesystem)
- Log storage metrics daily: "Screenshot storage: X GB used"
- Alert when storage exceeds threshold (e.g., 80% of configured limit)
- Expose storage metrics via monitoring endpoint (Epic 8)
**And** monitoring doesn't impact application performance
**And** storage path is configurable via environment variable


## Epic 7: System Resilience & Quality Assurance

System operates reliably with graceful degradation when AI providers or browser automation fails, implements fallback mechanisms, enforces AI quality baselines (70% confidence minimum, 80% executable tests), handles timeouts (60s AI default), implements rate limiting (10 runs/hour per user), and ensures 85% test execution success rate.

### Story 7.1: Implement Rate Limiting Middleware

As a **system administrator**,
I want **rate limiting on test execution endpoints**,
So that **users can't overwhelm the system with excessive requests**.

**Acceptance Criteria:**

**Given** the API has rate limiting middleware installed
**When** I configure rate limits per NFR33
**Then** rate limiting should:
- Limit test run creation: 10 requests/hour per user (by userId)
- Limit general API: 100 requests/minute per user
- Use express-rate-limit middleware
- Track limits in Redis for distributed systems
- Return 429 status with headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Error message: "Rate limit exceeded. Try again in X minutes."
**And** rate limits are configurable via environment variables
**And** authenticated users are tracked by userId, unauthenticated by IP

### Story 7.2: Implement Test Execution Timeout Enforcement

As a **developer**,
I want **timeout enforcement for test executions**,
So that **tests don't run indefinitely and consume resources**.

**Acceptance Criteria:**

**Given** test execution is running
**When** I implement timeout logic
**Then** the system should:
- Set configurable timeout per test scenario (default: 120 seconds per NFR49)
- Set overall test run timeout (default: 30 minutes)
- Monitor execution time in worker
- If timeout exceeded, terminate browser instance
- Update TestRun status to FAILED with error: "Test execution timed out"
- Update scenario status to FAILED: "Execution exceeded timeout"
- Clean up resources properly
**And** timeouts are configurable via environment variables
**And** logs indicate timeout reason clearly

### Story 7.3: Implement Concurrent Execution Limits

As a **system administrator**,
I want **concurrent execution limits enforced**,
So that **the system doesn't exceed resource capacity**.

**Acceptance Criteria:**

**Given** multiple users are running tests
**When** I implement concurrency control
**Then** the system should:
- Track active executions per user (limit: 3 concurrent per NFR29)
- Track total system active executions (limit: 50 concurrent per NFR30)
- Check limits before starting test execution
- If limit reached, delay job and requeue with backoff
- Log: "Concurrency limit reached, job delayed"
**And** limits are configurable via environment variables
**And** Redis is used to track active executions across workers
**And** limits are released when tests complete, fail, or are cancelled

### Story 7.4: Implement AI Quality Validation

As a **developer**,
I want **quality validation for AI-generated test scenarios**,
So that **only high-quality tests are executed**.

**Acceptance Criteria:**

**Given** AI generates test scenarios
**When** I implement quality validation
**Then** the system should:
- Check confidence scores meet minimum threshold (70% per NFR40)
- Flag scenarios below threshold with warning badge in UI
- Validate that scenarios are executable (have valid steps)
- Log quality metrics: "Generated X scenarios, Y below confidence threshold"
- Track quality baseline: 80% of tests must be executable (NFR39)
**And** low-confidence scenarios can still be executed (user choice)
**And** quality metrics are logged for monitoring

### Story 7.5: Implement Flaky Test Detection

As a **developer**,
I want **detection of flaky test scenarios**,
So that **inconsistent tests are identified and flagged**.

**Acceptance Criteria:**

**Given** the same test scenario runs multiple times
**When** I implement flaky test detection
**Then** the system should:
- Track execution history per scenario (same URL + steps)
- Identify scenarios that produce different results on identical runs
- Flag scenario as "flaky" if pass/fail alternates
- Display flaky badge in report UI
- Log: "Flaky test detected: {scenario description}"
**And** flaky detection is passive (doesn't block execution)
**And** minimum 2 runs required to detect flakiness


## Epic 8: Monitoring, Observability & Operations

System operators can monitor health metrics (AI provider performance, job queue depth, Playwright execution), track KPIs (active users, test runs/day, storage usage), receive alerts on critical failures, manage zero-downtime deployments, perform automated backups, and access API documentation.

### Story 8.1: Implement Health Check Endpoints

As a **system operator**,
I want **health check endpoints for monitoring**,
So that **I can verify system components are functioning**.

**Acceptance Criteria:**

**Given** the API is running
**When** I GET `/api/health`
**Then** I should receive 200 response with:
- `{ status: "healthy", timestamp: "..." }`
- Database connection status
- Redis connection status
- Version information
**And** unhealthy components return 503 status

**When** I GET `/api/health/deep`
**Then** I should receive detailed health check:
- Database query test (SELECT 1)
- Redis ping test
- BullMQ queue connectivity
- Filesystem write test
- AI provider connectivity (optional test)
**And** each component reports individual status

### Story 8.2: Implement Application Metrics Collection

As a **system operator**,
I want **KPI and performance metrics collection**,
So that **I can understand system usage and performance**.

**Acceptance Criteria:**

**Given** the application is running
**When** I implement metrics collection
**Then** the system should track:
- Active users (daily, weekly, monthly)
- Test runs per day
- Test execution success rate
- Average test duration
- Screenshot storage usage
- AI provider usage (calls per provider)
- Job queue depth and processing time
**And** metrics are exposed at `/api/metrics` endpoint (Prometheus format optional)
**And** metrics are logged for historical analysis

### Story 8.3: Implement AI Provider Performance Monitoring

As a **system operator**,
I want **monitoring of AI provider performance**,
So that **I can identify provider issues and optimize usage**.

**Acceptance Criteria:**

**Given** AI providers are being used
**When** I implement AI monitoring
**Then** the system should track per provider:
- Response time (average, p95, p99)
- Success rate (successful vs failed calls)
- Error types and counts
- Timeout rate
- Fallback trigger rate
**And** metrics are logged with provider name
**And** alerts trigger when provider success rate < 90%

### Story 8.4: Implement Job Queue Monitoring

As a **system operator**,
I want **monitoring of BullMQ queue health**,
So that **I can identify bottlenecks and failures**.

**Acceptance Criteria:**

**Given** BullMQ is processing jobs
**When** I implement queue monitoring
**Then** the system should track:
- Queue depth (jobs waiting)
- Active jobs count
- Completed jobs count
- Failed jobs count
- Average processing time
- Worker count
**And** metrics exposed via BullMQ dashboard or custom endpoint
**And** alerts trigger when queue depth > 100 jobs

### Story 8.5: Implement Centralized Logging

As a **system operator**,
I want **structured logging across all components**,
So that **I can debug issues and analyze system behavior**.

**Acceptance Criteria:**

**Given** the application is running
**When** I implement logging
**Then** logs should include:
- Timestamp, log level, component, message
- Request ID for tracing
- User ID for user-specific logs
- Test run ID for test-specific logs
- Error stack traces
**And** logs are written to stdout (container-friendly)
**And** log levels configurable via environment (DEBUG, INFO, WARN, ERROR)
**And** sensitive data (passwords, API keys) never logged
**And** retention: 90 days for application logs, permanent for security logs (NFR55)

### Story 8.6: Implement Critical Failure Alerting

As a **system operator**,
I want **alerts for critical system failures**,
So that **I can respond quickly to outages**.

**Acceptance Criteria:**

**Given** critical failures occur
**When** I implement alerting
**Then** alerts should trigger for:
- All AI providers unavailable
- Database connection lost
- Redis connection lost
- BullMQ worker crashed
- Storage threshold exceeded (80%)
- Rate limit violations spike
**And** alerts log ERROR level with clear description
**And** optional webhook/email notifications (post-MVP)

### Story 8.7: Implement Swagger/OpenAPI Documentation

As a **developer**,
I want **interactive API documentation**,
So that **I can understand and test API endpoints easily**.

**Acceptance Criteria:**

**Given** the API is running
**When** I access `/api/v1/docs`
**Then** I should see Swagger UI with:
- All API endpoints documented
- Request/response schemas
- Authentication requirements
- Example requests and responses
- "Try it out" functionality with JWT auth
**And** documentation is generated from code (JSDoc or decorators)
**And** OpenAPI 3.0 spec is exported

### Story 8.8: Implement Database Migrations and Backup Strategy

As a **system operator**,
I want **automated database migrations and backups**,
So that **schema changes are versioned and data is protected**.

**Acceptance Criteria:**

**Given** Prisma is managing the database
**When** schema changes are made
**Then** migrations should:
- Be versioned and tracked in source control
- Apply automatically on deployment (`prisma migrate deploy`)
- Be reversible (down migrations documented)
- Be tested in staging before production
**And** backup strategy documented:
- Daily automated backups (NFR60)
- 30-day backup retention
- Backup verification process
- Recovery procedure documented (24-hour recovery SLA per NFR60)

### Story 8.9: Implement Zero-Downtime Deployment Support

As a **system operator**,
I want **deployment configuration for zero downtime**,
So that **updates don't disrupt user experience**.

**Acceptance Criteria:**

**Given** new version is ready to deploy
**When** I implement zero-downtime strategy
**Then** deployment should:
- Use rolling deployment pattern (update instances gradually)
- Database migrations are backward compatible during rollout
- Health checks verify new instances before routing traffic
- Old instances drain connections before shutdown
**And** deployment documentation includes:
- Rollback procedure
- Database migration rollback plan
- Monitoring checklist during deployment
- Maintenance mode capability for critical updates (NFR62)

