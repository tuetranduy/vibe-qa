# Story 1.6: Implement User Profile Management

Status: review

## Story

As an **authenticated user**,
I want **to view and update my profile information**,
So that **I can keep my account details current**.

## Acceptance Criteria

### AC1: GET /api/v1/users/me - Retrieve Current User Profile

**Given** I am authenticated
**When** I GET `/api/v1/users/me`
**Then** I should receive my user profile (id, email, name, createdAt) without password
**And** requests without authentication should return 401 error

### AC2: PATCH /api/v1/users/me - Update User Profile

**Given** I am authenticated
**When** I PATCH `/api/v1/users/me` with updated name
**Then** my User record should be updated in the database
**And** I should receive 200 response with updated profile
**And** email field should not be updatable (return 400 if attempted)
**And** other users' attempts to update my profile should fail with 403 error

## Tasks / Subtasks

- [x] Create user routes file with auth middleware (AC: #1, #2)
  - [x] Create `apps/api/src/modules/users/users.routes.ts` with Express Router
  - [x] Import and apply `authMiddleware` to protect routes
  - [x] Define GET /me and PATCH /me endpoints with TypeScript types
  - [x] Export `userRouter` for main app integration

- [x] Implement GET /api/v1/users/me endpoint (AC: #1)
  - [x] Extract `req.user.id` from authenticated request
  - [x] Query Prisma User model excluding password field
  - [x] Return 200 with user data in standardized response format
  - [x] Handle user not found edge case (return 404)

- [x] Create Zod validation schema for profile updates (AC: #2)
  - [x] Create `apps/api/src/modules/users/users.validation.ts`
  - [x] Define `updateProfileSchema` with name field (strict mode)
  - [x] Ensure email is NOT allowed in schema (security requirement)
  - [x] Export schema for route handler use

- [x] Implement PATCH /api/v1/users/me endpoint (AC: #2)
  - [x] Validate request body with `updateProfileSchema`
  - [x] Return 400 if email field is present in request body
  - [x] Update User record in database with Prisma
  - [x] Return 200 with updated user profile
  - [x] Handle validation errors and database errors

- [x] Register user routes in main Express app (AC: #1, #2)
  - [x] Import `userRouter` in `apps/api/src/index.ts`
  - [x] Mount router at `/api/v1/users` path
  - [x] Verify route ordering (auth middleware applied correctly)

- [x] Write comprehensive unit tests (AC: #1, #2)
  - [x] Test GET /me with valid authentication
  - [x] Test GET /me returns 401 without authentication
  - [x] Test PATCH /me updates name successfully
  - [x] Test PATCH /me rejects email updates with 400
  - [x] Test PATCH /me returns 401 without authentication
  - [x] Test all edge cases (empty name, long name, unexpected fields)
  - [x] Ensure 100% route handler coverage

- [x] Manual testing and validation (AC: #1, #2)
  - [x] All automated tests pass (62/62 tests)
  - [x] GET /me with valid token → 200 with profile
  - [x] GET /me without token → 401
  - [x] PATCH /me with name update → 200 with updated profile
  - [x] PATCH /me with email field → 400 error
  - [x] Verify all responses follow standardized format

## Dev Notes

### API Route Pattern (Following Story 1-4, 1-5 Patterns)

**Router Structure:**
- Create dedicated `user.routes.ts` file following `auth.routes.ts` pattern
- Apply `authMiddleware` to ALL user routes (profile operations require authentication)
- Use Express Router with TypeScript types for type safety
- All handlers must be async and use try/catch with `next(error)` for centralized error handling

**Response Format (Standardized across all routes):**
```typescript
// Success response (200)
{
  data: {
    user: {
      id: string,
      email: string,
      name: string,
      createdAt: Date,
      updatedAt: Date
    }
  },
  meta: {
    requestId: string,    // From req.id or uuidv4()
    timestamp: string     // ISO 8601 format
  }
}

// Error response (400, 401, 404)
{
  error: {
    code: string,         // e.g., "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"
    message: string       // User-friendly error message
  },
  meta: {
    requestId: string
  }
}
```

### Authentication & Authorization Pattern

**JWT Authentication:**
- `authMiddleware` extracts token, verifies, and attaches `req.user = { id, email }` (from Story 1-5)
- Use `req.user.id` to ensure users can only access/modify their own profile (ownership enforcement)
- Never trust client-provided user IDs in request body or query params
- 401 errors handled automatically by middleware for missing/invalid tokens

**Ownership Enforcement:**
- GET /me uses `req.user.id` from JWT to fetch the correct user (no URL parameter needed)
- PATCH /me uses `req.user.id` to update only the authenticated user's profile
- No risk of privilege escalation since user ID comes from verified JWT, not request data

### Validation & Security

**Zod Schema for PATCH /me:**
```typescript
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  // Email explicitly NOT included (security requirement)
});
```

**Security Rules:**
- Email field MUST NOT be updatable (per acceptance criteria)
- If client sends email in PATCH body, return 400 with clear error message
- Never expose password field in ANY response (use Prisma select to exclude)
- Validate all inputs with Zod before database operations

### Database Operations

**Prisma Queries:**
```typescript
// GET /me - Fetch user excluding password
const user = await prisma.user.findUnique({
  where: { id: req.user.id },
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    // password: false (excluded by omission)
  }
});

// PATCH /me - Update user profile
const updatedUser = await prisma.user.update({
  where: { id: req.user.id },
  data: { name: validatedInput.name },
  select: { id: true, email: true, name: true, createdAt: true, updatedAt: true }
});
```

**Error Handling:**
- User not found after JWT validation → 404 (edge case: user deleted after login)
- Prisma errors → Caught by centralized error handler (next(error))
- Validation errors → 400 with Zod error details

### Testing Strategy (Vitest, NOT Jest)

**Unit Test Coverage Requirements:**
1. GET /me with valid auth → 200 with user profile (no password)
2. GET /me with missing auth → 401 (middleware test, may be redundant)
3. PATCH /me with valid name update → 200 with updated profile
4. PATCH /me with email field → 400 error (security test)
5. PATCH /me with invalid name (too long/empty) → 400 validation error
6. PATCH /me with valid auth → 401 (middleware test)

**Mock Strategy:**
- Use `vi.mock('@vibe-qa/database')` to mock Prisma client
- Mock `authMiddleware` to inject `req.user = { id: 'test-id', email: 'test@example.com' }`
- DO NOT use `jest.mock()` or `jest.fn()` (use Vitest equivalents: `vi.mock()`, `vi.fn()`)

**Test File Location:**
- `apps/api/src/routes/user.routes.test.ts` (colocated with route file)

### Project Structure Notes

**Alignment with Turborepo Monorepo:**
- Route handlers in `apps/api/src/routes/user.routes.ts`
- Validation schemas in `apps/api/src/validation/user.schema.ts`
- Import Prisma client from `@vibe-qa/database` package (NOT relative path)
- Import `authMiddleware` from `../middleware/auth.middleware` (same app)

**File Organization:**
```
apps/api/src/
  ├── routes/
  │   ├── auth.routes.ts          (existing, Story 1-4)
  │   ├── user.routes.ts          (NEW, this story)
  │   └── user.routes.test.ts     (NEW, this story)
  ├── validation/
  │   ├── auth.schema.ts          (existing, Story 1-3)
  │   └── user.schema.ts          (NEW, this story)
  ├── middleware/
  │   └── auth.middleware.ts      (existing, Story 1-5)
  └── index.ts                    (register userRouter)
```

### References

**Source Documents:**
- [Epic 1, Story 1.6: `_bmad-output/planning-artifacts/epics.md`]
- [API Patterns: `_bmad-output/project-context.md` - JWT Authentication Pattern, API Response Format]
- [Architecture: `_bmad-output/planning-artifacts/architecture.md` - User Management API Routes]

**Related Stories:**
- **Story 1-4:** User Login with JWT (JWT token generation, verifyToken utility)
- **Story 1-5:** JWT Authentication Middleware (authMiddleware implementation)
- **Story 1-3:** User Registration (Zod validation pattern, password hashing)

**NFRs & Architecture:**
- **ARCH12:** JWT with bcrypt for authentication
- **ARCH17:** RESTful API with versioning (/api/v1/...)
- **ARCH13:** Zod for runtime validation with TypeScript types
- **NFR20-NFR23:** Security requirements (no password exposure, input validation)
- **NFR45:** Performance requirements (no unnecessary database queries)

---

## Previous Story Intelligence

**From Story 1-5 (JWT Authentication Middleware):**
- All protected routes now use `authMiddleware` to verify JWT and attach `req.user`
- Middleware returns standardized 401 responses for auth failures
- `req.user.id` is the ONLY trusted source for user identity
- Vitest is the testing framework (NOT Jest) - use `vi.mock()` and `vi.fn()`
- TypeScript strict mode enforced - extend Express Request type for `req.user`

**Code Patterns Established:**
- Express type extensions in `apps/api/src/types/express.d.ts`
- Standardized error responses with `requestId` and `timestamp` in `meta`
- Comprehensive JSDoc comments for middleware and utilities
- 100% test coverage for critical authentication logic

**Testing Insights:**
- Mock Prisma client with `vi.mock('@vibe-qa/database')`
- Use `vi.fn()` for creating mock functions
- Test both success and error paths for complete coverage
- Edge case: Empty token handling ("Bearer " with no token)

---

## Git Intelligence Summary

**Recent Commits (Last 10):**
- `73f1817 (HEAD -> main) feat: initialize turborepo monorepo structure`

**Pattern Analysis:**
- Project recently initialized with Turborepo monorepo structure
- Conventional Commits format used (`feat:` prefix)
- Likely early in development cycle (only 1 commit visible)

**Implications for This Story:**
- Follow Turborepo workspace conventions (import from `@vibe-qa/*` packages)
- Continue using Conventional Commits (e.g., `feat: implement user profile management`)
- Ensure all new files follow established monorepo structure

---

## Latest Tech Information

**Express.js 4.x Best Practices (2026):**
- Always use async route handlers with try/catch and `next(error)` for centralized error handling
- Use TypeScript strict mode for full type safety
- Apply middleware at route level (not globally) for granular control
- Use `Router()` for modular route organization

**Prisma ORM (Current Best Practices):**
- Use `select` instead of `include` for performance (only fetch needed fields)
- Never expose sensitive fields (password) in queries
- Use `update()` with `where` clause for safe updates (no raw SQL)
- Handle `RecordNotFound` errors gracefully (user deleted after login edge case)

**Zod Validation (2026 Standards):**
- Define schemas once, reuse across validation and TypeScript types
- Use `.optional()` for partial updates (PATCH endpoints)
- Explicitly exclude forbidden fields (email) to prevent accidental updates
- Validate before database operations to prevent invalid data writes

**Vitest Testing Framework:**
- Use `vi.mock()` for module mocking (NOT `jest.mock()`)
- Use `vi.fn()` for function mocking (NOT `jest.fn()`)
- Colocate test files with source files (`*.test.ts` pattern)
- Use descriptive test names with Given/When/Then format for clarity

---

## Project Context Reference

**Critical Rules from `_bmad-output/project-context.md`:**

**JWT Authentication Pattern:**
- All protected routes require `Authorization: Bearer <token>` header
- Middleware extracts and verifies JWT before route handler execution
- User ID from JWT payload used for ownership checks (users access only their own resources)
- Token expiration: 7 days (no refresh token in MVP)

**API Response Format (Standardized):**
```typescript
// Success response
{ data: T, meta: { requestId: string, timestamp: string } }

// Error response
{ error: { code: string, message: string, details?: any }, meta: { requestId: string } }
```

**Request Validation Pattern:**
- Define Zod schemas for all request bodies, params, and query strings
- Validate before business logic using middleware or at handler entry
- Return 400 with validation errors if Zod parsing fails

**Resource Ownership Pattern:**
- Extract `userId` from JWT payload in auth middleware
- Attach to `req.user` object for route handlers
- Query database with `WHERE userId = req.user.id` to enforce ownership
- Return 404 (not 403) for resources that don't belong to user (security best practice)

**Testing Rules:**
- All tests must be colocated with the code they test as `*.test.ts(x)` or in `tests/` directories
- Use Vitest for frontend, Jest for backend unit tests (NOTE: Story 1-5 established Vitest for API tests)
- Use mocks for external services in unit tests
- Maintain at least 80% code coverage; critical paths must be 100% covered

**Code Quality Rules:**
- Use camelCase for variables/functions, PascalCase for components/classes, kebab-case for files
- All exported functions and components must have JSDoc or TSDoc comments
- Keep functions under 40 lines; split logic into helpers if longer
- No magic numbers or strings; use named constants

**Monorepo Rules:**
- All packages must be referenced by workspace name (e.g., `@vibe-qa/database`), never by relative paths
- Apps can depend on packages, but packages should NOT depend on apps
- Use TypeScript path aliases defined in root `tsconfig.json` for clean imports

---

## Completion Status

**Story Status:** ready-for-dev  
**Sprint Status:** To be updated to `ready-for-dev` after story file creation

**Completion Note:**
Ultimate context engine analysis completed - comprehensive developer guide created. This story file contains:
- ✅ Full acceptance criteria with BDD format
- ✅ Detailed task breakdown with subtasks
- ✅ API patterns and authentication/authorization guidelines
- ✅ Security requirements and validation rules
- ✅ Database operation patterns with Prisma examples
- ✅ Testing strategy with Vitest (NOT Jest)
- ✅ Project structure alignment with Turborepo monorepo
- ✅ Previous story learnings (Story 1-5: authMiddleware patterns, Vitest usage)
- ✅ Git intelligence (commit patterns, conventional commits)
- ✅ Latest tech best practices (Express, Prisma, Zod, Vitest)
- ✅ Project context rules (JWT pattern, API format, ownership, testing)

**Ready for Dev Agent:** All guardrails in place for flawless implementation.

---

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

**Implementation Summary:**
- ✅ Implemented GET /api/v1/users/me endpoint with authentication
- ✅ Implemented PATCH /api/v1/users/me endpoint with name updates only
- ✅ Created modular users module following project structure patterns
- ✅ Applied Zod validation with strict mode to prevent email updates
- ✅ Used Prisma select pattern to exclude password from all responses
- ✅ Wrote comprehensive tests covering all acceptance criteria (12 tests, 100% pass rate)
- ✅ Fixed test isolation issues by configuring fileParallelism: false in vitest.config
- ✅ All 62 tests pass in full test suite

**Technical Decisions:**
- Placed user module in `apps/api/src/modules/users/` instead of `apps/api/src/routes/` for better organization
- Used Zod `.strict()` mode to automatically reject unexpected fields including email
- Applied sequential test file execution to avoid database conflicts with shared test database
- Followed existing auth patterns for consistent error handling and response format

**Security Implementation:**
- Password field never exposed via explicit Prisma `select` statements
- Authentication required on all profile endpoints via authMiddleware
- Email updates blocked at validation layer with detailed error messages
- Users can only access their own profile (userId from JWT token)

### File List

**Created:**
- `apps/api/src/modules/users/users.routes.ts` - User profile routes with auth middleware
- `apps/api/src/modules/users/users.controller.ts` - Profile GET and PATCH handlers
- `apps/api/src/modules/users/users.validation.ts` - Zod schema for profile updates
- `apps/api/src/modules/users/users.test.ts` - Comprehensive test suite (12 tests)

**Modified:**
- `apps/api/src/index.ts` - Mounted user routes at /api/v1/users and exported app
- `packages/shared-types/src/index.ts` - Added ProfileResponse and UpdateProfileRequest interfaces
- `apps/api/vitest.config.ts` - Added fileParallelism: false to prevent DB conflicts

---

**Generated:** 2026-01-06T15:36:20.123Z  
**Story ID:** 1-6  
**Story Key:** 1-6-implement-user-profile-management  
**Epic:** 1 (Project Foundation & Authentication)  
**Sprint:** Epic 1 - In Progress
