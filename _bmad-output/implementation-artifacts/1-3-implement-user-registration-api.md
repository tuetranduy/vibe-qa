# Story 1.3: Implement User Registration API

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **QA user**,
I want **to register for an account via API**,
so that **I can authenticate and use vibe-qa for automated testing**.

## Acceptance Criteria

**Given** no existing user account
**When** POST `/api/v1/auth/register` with:
```json
{
  "email": "sarah@example.com",
  "password": "MyS3cureP@ss",
  "name": "Sarah Chen"
}
```
**Then** the system should:
- Validate email format (RFC 5322 compliant)
- Validate password meets requirements (min 8 chars, uppercase, lowercase, number, special char)
- Hash password with bcrypt (cost factor 12)
- Create User record in database
- Return 201 status with user data (without password hash):
```json
{
  "data": {
    "id": 1,
    "email": "sarah@example.com",
    "name": "Sarah Chen",
    "createdAt": "2026-01-06T14:50:27.948Z"
  },
  "meta": {
    "requestId": "uuid-v4",
    "timestamp": "2026-01-06T14:50:27.948Z"
  }
}
```

**And** when email already exists
**Then** return 400 with error:
```json
{
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already registered"
  },
  "meta": {
    "requestId": "uuid-v4",
    "timestamp": "2026-01-06T14:50:27.948Z"
  }
}
```

**And** when password validation fails
**Then** return 400 with validation details:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
  },
  "meta": {
    "requestId": "uuid-v4"
  }
}
```

**And** password is NEVER returned in any API response
**And** password is NEVER logged (even in error logs)

## Tasks / Subtasks

- [ ] Create password validation schema with Zod (AC: password requirements)
  - [ ] Define password schema: min 8 chars, uppercase, lowercase, number, special char
  - [ ] Define email schema: valid email format
  - [ ] Define name schema: non-empty string, max 255 chars
  - [ ] Create RegisterRequestSchema combining all fields
  - [ ] Export schema from `apps/api/src/validation/auth.schema.ts`
- [x] Implement bcrypt password hashing utility (AC: bcrypt cost 12)
  - [x] Install bcrypt: `npm install bcrypt @types/bcrypt -w apps/api`
  - [x] Create `apps/api/src/utils/password.ts` with `hashPassword(plain: string): Promise<string>`
  - [x] Use bcrypt with cost factor 12 (from architecture requirements)
  - [x] Add unit tests for password hashing (verify hash format, verify cost factor) - 7/7 passing
- [x] Create registration endpoint handler (AC: POST /api/v1/auth/register)
  - [x] Create `apps/api/src/routes/auth.routes.ts` with Express Router
  - [x] POST `/register` endpoint handler
  - [x] Validate request body using RegisterRequestSchema
  - [x] Check if email exists: `await prisma.user.findUnique({ where: { email } })`
  - [x] If exists, return 400 with EMAIL_EXISTS error
  - [x] Hash password using hashPassword utility
  - [x] Create user: `await prisma.user.create({ data: { email, password: hashedPassword, name } })`
  - [x] Return 201 with user data (exclude password field)
  - [x] Wrap in try-catch with error handling middleware
- [x] Implement standardized error response format (AC: error response structure)
  - [x] Create `apps/api/src/middleware/errorHandler.ts`
  - [x] Handle Zod validation errors → 400 with VALIDATION_ERROR (NOTE: Zod uses err.issues not err.errors)
  - [x] Handle Prisma unique constraint errors → 400 with EMAIL_EXISTS
  - [x] Handle generic errors → 500 with INTERNAL_ERROR
  - [x] Always include meta.requestId and meta.timestamp
  - [x] Never expose stack traces in production (check NODE_ENV)
- [x] Add request ID middleware for tracing (AC: requestId in responses)
  - [x] Install uuid: `npm install uuid @types/uuid -w apps/api`
  - [x] Create `apps/api/src/middleware/requestId.ts`
  - [x] Generate UUID v4 for each request
  - [x] Attach to `req.id` for use in handlers
  - [x] Include in all response meta objects
- [x] Register auth routes in Express app (AC: endpoint available)
  - [x] Import auth router in `apps/api/src/index.ts`
  - [x] Mount at `/api/v1/auth` prefix
  - [x] Apply requestId middleware before auth routes
  - [x] Apply error handler middleware after all routes
- [x] Add integration tests for registration endpoint (AC: all scenarios tested)
  - [x] Test successful registration (201 response)
  - [x] Test duplicate email (400 EMAIL_EXISTS)
  - [x] Test invalid password format (400 VALIDATION_ERROR)
  - [x] Test invalid email format (400 VALIDATION_ERROR)
  - [x] Test missing required fields (400 VALIDATION_ERROR)
  - [x] Verify password is hashed in database (not plaintext)
  - [x] Verify password never returned in response
  - [x] Use supertest for HTTP testing
  - [x] Clean up test database after each test - 11/11 tests passing

## Dev Notes

### Architecture & Technical Requirements

**API Design Pattern (from Project Context):**
- **RESTful Endpoints:** All auth routes under `/api/v1/auth` prefix
- **Request Validation:** Zod schemas for runtime type checking and validation
- **Error Handling:** Centralized error middleware with standardized format
- **Password Security:** bcrypt with cost factor 12 (from NFR45)
- **Response Format:** Consistent data/error structure with meta information

**Password Requirements (from Architecture NFR45):**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Maximum 255 characters (practical limit)

**Database Integration:**
- Use `@vibe-qa/database` package (from Story 1.2)
- Import PrismaClient singleton: `import { prisma } from '@vibe-qa/database'`
- User model already defined with email (unique), password, name fields
- Prisma will automatically enforce email uniqueness (throws PrismaClientKnownRequestError)

**Security Critical Rules:**
- **NEVER log passwords** - not even validation errors should reveal password value
- **NEVER return password hash** - exclude from all API responses
- **Always validate input** - never trust client data
- **Use bcrypt cost 12** - security requirement from architecture
- **Sanitize error messages** - don't reveal internal details to clients

### Previous Story Learnings

**From Story 1.1 (Monorepo Setup):**
- Use workspace protocol for dependencies: `"@vibe-qa/database": "workspace:*"`
- Run build from root: `turbo run build`
- Turborepo tasks defined in turbo.json (ensure API task dependencies correct)
- TypeScript strict mode enabled - no `any` types allowed
- Use Vitest for testing consistency

**From Story 1.2 (Database Setup):**
- Prisma Client available: `import { prisma } from '@vibe-qa/database'`
- User model structure:
  ```typescript
  {
    id: number;
    email: string; // unique constraint
    password: string; // stores bcrypt hash (60 chars)
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- Database connection verified in API startup
- Health check endpoint exists at `/health`

**Patterns Established:**
- Express app structure in `apps/api/src/index.ts`
- Test files colocated as `*.test.ts`
- TypeScript configuration working across workspace
- Docker containers (MySQL, Redis) running via docker-compose

### Critical Implementation Rules

**From Project Context:**

1. **Request Validation Pattern:**
   - Define Zod schemas for all request bodies
   - Validate before business logic
   - Return 400 with clear validation messages
   - Never use `any` or skip type validation

2. **Error Handling Pattern:**
   - All async handlers must use try-catch
   - Centralized error middleware formats responses
   - Custom error classes with HTTP status codes
   - Never expose stack traces in production

3. **Password Security:**
   - bcrypt cost factor: **12** (not configurable - security requirement)
   - Hash format: bcrypt generates 60-character hash string
   - Never log or return password/hash
   - Validate password strength before hashing

4. **API Response Format:**
   ```typescript
   // Success
   { data: T, meta: { requestId: string, timestamp: string } }
   
   // Error
   { error: { code: string, message: string, details?: any }, meta: { requestId: string } }
   ```

5. **Database Operations:**
   - Use Prisma for all database queries
   - Handle Prisma-specific errors (PrismaClientKnownRequestError for unique violations)
   - Never construct raw SQL queries
   - Always use transactions for multi-step operations (not needed in this story)

### Code Quality & Testing

**Testing Strategy:**
- Integration tests using supertest (HTTP request testing)
- Unit tests for password hashing utility
- Test database cleanup after each test (use beforeEach/afterEach)
- Minimum 80% code coverage required
- Test all acceptance criteria scenarios

**TypeScript Requirements:**
- Strict mode enabled (no implicit any)
- All functions have explicit return types
- Request/response types defined
- Zod schemas provide runtime + compile-time types

**Code Organization:**
```
apps/api/src/
├── index.ts                    # Main Express app
├── routes/
│   └── auth.routes.ts          # Auth endpoints
├── middleware/
│   ├── errorHandler.ts         # Centralized error handling
│   └── requestId.ts            # Request ID generation
├── validation/
│   └── auth.schema.ts          # Zod validation schemas
└── utils/
    └── password.ts             # Password hashing utility
```

### File Structure Requirements

**New Files to Create:**
1. `apps/api/src/routes/auth.routes.ts` - Registration endpoint
2. `apps/api/src/middleware/errorHandler.ts` - Error handling middleware
3. `apps/api/src/middleware/requestId.ts` - Request ID middleware
4. `apps/api/src/validation/auth.schema.ts` - Zod validation schemas
5. `apps/api/src/utils/password.ts` - Password hashing utility
6. `apps/api/src/routes/auth.routes.test.ts` - Integration tests
7. `apps/api/src/utils/password.test.ts` - Unit tests

**Files to Modify:**
1. `apps/api/src/index.ts` - Register auth routes and middleware
2. `apps/api/package.json` - Add bcrypt and uuid dependencies

### Environment & Configuration

**Dependencies to Install:**
```bash
# From project root
npm install bcrypt uuid -w apps/api
npm install @types/bcrypt @types/uuid -D -w apps/api
npm install zod -w apps/api
```

**Environment Variables (already configured):**
- DATABASE_URL: Connection to MySQL (from docker-compose)
- NODE_ENV: development/production (affects error verbosity)

**No new environment variables needed for this story.**

### References

- [Project Context: Authentication & API Patterns](_bmad-output/project-context.md#authentication--api-patterns)
- [Project Context: Database Rules](_bmad-output/project-context.md#database--orm-rules)
- [Architecture: Authentication Patterns](_bmad-output/planning-artifacts/architecture.md#authentication--api-patterns)
- [Architecture: NFR45 - Password Hashing](_bmad-output/planning-artifacts/architecture.md#security-requirements)
- [Epic 1.3: User Registration API](_bmad-output/planning-artifacts/epics.md#story-13-implement-user-registration-api)
- [Previous Story: 1.2 Database Setup](_bmad-output/implementation-artifacts/1-2-set-up-database-schema-and-prisma-orm.md)

### Latest Technology Versions (as of 2026-01-06)

**bcrypt:**
- Version: 5.1.x (latest stable)
- Hash length: 60 characters (fixed by bcrypt algorithm)
- Cost factor 12: ~250ms per hash (secure and performant balance)
- Salt automatically included in hash output

**Zod:**
- Version: 3.22.x (latest stable)
- TypeScript-first schema validation
- Runtime type checking with compile-time inference
- Better error messages than alternatives (Joi, Yup)

**uuid:**
- Version: 9.x or 10.x (latest stable)
- UUID v4 for random request IDs
- Crypto-secure random generation

**Zod Password Validation Example:**
```typescript
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[0-9]/, "Password must contain number")
  .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, "Password must contain special character");
```

### Success Criteria Checklist

After completing this story, verify:
- [ ] POST `/api/v1/auth/register` endpoint responds correctly
- [ ] Password validation enforces all requirements
- [ ] Password is hashed with bcrypt cost 12
- [ ] User created in database with hashed password
- [ ] Duplicate email returns 400 EMAIL_EXISTS error
- [ ] Invalid password returns 400 VALIDATION_ERROR
- [ ] Response excludes password field
- [ ] Response includes requestId and timestamp
- [ ] Error handling middleware catches all errors
- [ ] All integration tests pass (8 test cases minimum)
- [ ] Password utility unit tests pass
- [ ] No TypeScript errors
- [ ] `turbo run build` succeeds
- [ ] `turbo run test` passes with 80%+ coverage
- [ ] Logs never contain password values

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (Anthropic) via GitHub Copilot CLI

### Debug Log References

Key debugging moments:
- **ZodError.issues vs .errors**: Discovered Zod uses `err.issues` array, not `err.errors`. Fixed errorHandler.ts line 40.
- **Test response body empty**: Traced through error handler execution, found Zod API difference causing response serialization failure.

### Completion Notes List

**Implementation Decisions:**
- Used Zod for validation instead of manual checks - provides TypeScript inference and better error messages
- Separated password utilities into dedicated module for reusability in future auth stories
- Error handler uses instanceof checks for type-safe error handling
- Request ID attached to req object (as `req.id`) for consistent tracing across handlers

**Test Coverage:**
- Password utility: 7/7 tests passing (hash generation, comparison, edge cases)
- Integration tests: 11/11 tests passing (success, validations, errors, security checks)
- Total: 20/20 tests passing (including existing health check tests)

**Performance:**
- bcrypt cost 12: ~270-555ms per hash (acceptable for registration, secure per NFR45)
- Test suite execution: 3.4s total

**Security Validations:**
- ✅ Password never logged or returned in responses
- ✅ Password hashed before database storage (60-char bcrypt format verified)
- ✅ Unique constraint enforced via Prisma (EMAIL_EXISTS error on duplicates)
- ✅ All password requirements enforced via Zod regex patterns

**Known Issues/Limitations:**
- None. All acceptance criteria met.

### File List

**Files Created:**
- `apps/api/src/utils/password.ts` - bcrypt hashing utilities (cost 12)
- `apps/api/src/utils/password.test.ts` - unit tests for password utilities
- `apps/api/src/validation/auth.schema.ts` - Zod validation schemas
- `apps/api/src/middleware/errorHandler.ts` - centralized error handling
- `apps/api/src/middleware/requestId.ts` - UUID request ID generation
- `apps/api/src/routes/auth.routes.ts` - registration endpoint handler
- `apps/api/src/routes/auth.routes.test.ts` - integration tests for registration

**Files Modified:**
- `apps/api/src/index.ts` - registered auth routes, added middleware (requestId, errorHandler)
- `apps/api/package.json` - added dependencies (bcrypt, uuid, zod, @types/bcrypt, @types/uuid)
