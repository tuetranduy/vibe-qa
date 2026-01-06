# Story 1.5: Implement JWT Authentication Middleware

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **reusable authentication middleware to protect API routes**,
so that **only authenticated users can access protected resources and user identity is available in request handlers**.

## Acceptance Criteria

### AC1: Middleware extracts and verifies JWT tokens

**Given** a protected API route requires authentication  
**When** a request includes `Authorization: Bearer <token>` header  
**Then** the middleware should:
- Extract the token from Authorization header
- Verify token using JWT utilities (from Story 1-4)
- Decode token to get userId and email
- Attach user data to `req.user` object
- Call `next()` to proceed to route handler

**And** if token is valid, proceed to next middleware/handler  
**And** if token is missing, return 401 "Missing authentication token"  
**And** if token is invalid/expired, return 401 "Invalid or expired token"  
**And** if Authorization header malformed, return 401 "Invalid authorization format"

### AC2: Protected routes only accessible with valid authentication

**Given** routes are protected with authentication middleware  
**When** I implement middleware usage  
**Then** protected routes should:
- Use middleware via `router.use(authMiddleware)` or per-route `router.get('/path', authMiddleware, handler)`
- Return 401 for unauthenticated requests
- Allow authenticated requests to proceed
- Have access to `req.user.id` and `req.user.email` in route handlers

**And** public routes (register, login) remain unprotected  
**And** health check endpoint remains unprotected

### AC3: Middleware provides user context for route handlers

**Given** middleware successfully authenticates a request  
**When** route handler executes  
**Then** `req.user` should be available with:
- `id` (userId from JWT)
- `email` (email from JWT)

**And** route handlers can use `req.user.id` for ownership checks  
**And** TypeScript types extended for `req.user` (no `any` types)

## Architecture Compliance

**Authentication Pattern (from project-context.md):**
- Middleware extracts JWT from `Authorization: Bearer <token>` header
- Token verified using `verifyToken()` utility from Story 1-4
- User ID and email attached to `req.user` for downstream handlers
- Consistent 401 error responses for all auth failures
- Never expose internal error details (expired vs invalid) to prevent timing attacks

**Error Handling Pattern:**
- Use standardized error response format: `{ error: { code, message }, meta: { requestId } }`
- Error codes: `MISSING_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`
- All errors return 401 status (unauthorized)

**TypeScript Requirements:**
- Extend Express Request interface to include `user` property
- Strict type checking (no `any` types)
- Properly typed middleware signature: `(req: Request, res: Response, next: NextFunction) => void`

## Technical Requirements

### Dependencies

**Required Libraries:**
- `jsonwebtoken` - Already installed in Story 1-4
- `@types/express` - For extending Request interface
- No additional dependencies needed

### File Structure Requirements

**New Files to Create:**
```
apps/api/src/
├── middleware/
│   ├── auth.middleware.ts     # JWT authentication middleware
│   └── auth.middleware.test.ts # Unit tests for middleware
├── types/
│   └── express.d.ts           # Extend Express Request with user property
```

**Files to Modify:**
```
apps/api/src/routes/             # Apply middleware to protected routes (future stories)
apps/api/src/index.ts            # Optionally mount middleware globally
```

### Previous Story Intelligence (Story 1-4)

**Established Patterns from Story 1-4:**
- JWT utilities in `apps/api/src/utils/jwt.ts` with `generateToken()` and `verifyToken()`
- `verifyToken()` returns `{ userId: number; email: string } | null`
- JWT_SECRET loaded from environment in jwt.ts
- Standardized error response format with `error` and `meta` fields
- Request ID generation using `uuidv4()` for tracing

**Code Patterns to Follow:**
```typescript
// Import JWT utility (from Story 1-4)
import { verifyToken } from '../utils/jwt';

// Error response pattern (from Story 1-4)
return res.status(401).json({
  error: {
    code: 'INVALID_TOKEN',
    message: 'Invalid or expired token'
  },
  meta: { requestId: uuidv4(), timestamp: new Date().toISOString() }
});

// Request user type pattern (new in this story)
interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}
```

**Learnings from Story 1-3 and 1-4:**
- Always use try-catch for error handling
- Never expose sensitive data (passwords, full error stacks) in responses
- Use Prisma select to exclude password fields from queries
- Validate all inputs before processing (though middleware focuses on token validation)

### Git Intelligence Summary

**Recent Project Patterns (commit 73f1817):**
- Project uses Turborepo monorepo structure
- API app located at `apps/api/`
- Express.js framework with TypeScript strict mode
- Comprehensive test coverage required (80% minimum)
- Tests colocated with source as `*.test.ts` files
- File naming convention: kebab-case for files (e.g., `auth.middleware.ts`)

**Established Conventions:**
- Import statements grouped: external, internal, types
- Export functions at bottom of file
- Use async/await for asynchronous operations
- Consistent error handling with centralized middleware

## Latest Technical Information

### JWT Middleware Best Practices (2026)

**Token Extraction:**
- Check `Authorization` header format: `Bearer <token>`
- Trim whitespace from header value
- Handle missing header, malformed format, and empty token cases

**Security Considerations:**
- Never log JWT tokens (even in debug mode)
- Use constant-time comparison for token validation to prevent timing attacks
- Return same generic error message for all auth failures (don't reveal if token is expired vs invalid)
- Set appropriate cache headers: `Cache-Control: no-store` for protected routes

**TypeScript Express Extension:**
```typescript
// apps/api/src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}
export {};
```

**Performance Optimization:**
- JWT verification is fast (no database query)
- Consider caching user data in Redis for high-traffic routes (post-MVP)
- Middleware should be lightweight (no heavy operations)

### Express.js 4.x Middleware Pattern

**Standard Middleware Signature:**
```typescript
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Implementation
};
```

**Error Handling in Middleware:**
- Don't use `try-catch` if calling `next(error)` for centralized error handling
- For immediate 401 responses, send response directly without calling `next()`
- This middleware sends 401 directly (doesn't propagate errors)

**Middleware Usage Patterns:**
```typescript
// Option 1: Protect all routes under /api/v1/test-runs
router.use('/test-runs', authMiddleware);

// Option 2: Protect individual routes
router.get('/profile', authMiddleware, profileHandler);

// Option 3: Global middleware (less common for auth)
app.use('/api/v1/*', authMiddleware);
```

## Tasks / Subtasks

### Phase 1: TypeScript Type Extensions

- [x] Extend Express Request interface (AC3: user context availability)
  - [x] Create `apps/api/src/types/express.d.ts`
  - [x] Declare global Express namespace
  - [x] Extend Request interface with optional `user` property: `{ id: number; email: string }`
  - [x] Export empty object to make it a module
  - [x] Verify TypeScript recognizes extension (no `any` types needed)

### Phase 2: Authentication Middleware Implementation

- [x] Create authentication middleware (AC1: extract and verify JWT)
  - [x] Create `apps/api/src/middleware/auth.middleware.ts`
  - [x] Import dependencies: Express types, verifyToken, uuidv4
  - [x] Implement `authMiddleware` function:
    - Extract `Authorization` header from request
    - Check if header exists, return 401 "Missing authentication token" if not
    - Validate header format is "Bearer <token>", return 401 "Invalid authorization format" if not
    - Extract token from "Bearer <token>" (split on space, take second part)
    - Call `verifyToken(token)` to decode and verify
    - If null (invalid/expired), return 401 "Invalid or expired token"
    - If valid, attach decoded data to `req.user = { id: decoded.userId, email: decoded.email }`
    - Call `next()` to proceed to route handler
  - [x] Export `authMiddleware` as named export
  - [x] Add JSDoc comments explaining middleware purpose and usage

### Phase 3: Middleware Unit Tests

- [x] Create comprehensive unit tests (AC1, AC2: all scenarios)
  - [x] Create `apps/api/src/middleware/auth.middleware.test.ts`
  - [x] Mock `verifyToken` utility using Vitest mocks
  - [x] Test: Valid token → attaches user to req.user and calls next()
  - [x] Test: Missing Authorization header → returns 401 "Missing authentication token"
  - [x] Test: Malformed Authorization header (no "Bearer") → returns 401 "Invalid authorization format"
  - [x] Test: Invalid token (verifyToken returns null) → returns 401 "Invalid or expired token"
  - [x] Test: Expired token (verifyToken returns null) → returns 401 "Invalid or expired token"
  - [x] Test: Empty token string → returns 401 "Invalid authorization format"
  - [x] Test: Response includes requestId and timestamp in meta
  - [x] Verify all tests pass and coverage is 100% for middleware

### Phase 4: Integration with Existing Routes (Preparation)

- [x] Document middleware usage for future stories (AC2: protected routes)
  - [x] Add example usage in middleware file comments:
    ```typescript
    // Usage in routes:
    // import { authMiddleware } from '../middleware/auth.middleware';
    // router.get('/protected', authMiddleware, handler);
    // Access user in handler: req.user.id, req.user.email
    ```
  - [x] Note: Actual route protection will be implemented in future stories (1-6 Profile Management, etc.)
  - [x] Verify public routes (register, login, health) remain unprotected

### Phase 5: Testing and Validation

- [x] Run unit tests and verify coverage (AC: all acceptance criteria pass)
  - [x] Run: `npm test -w apps/api -- auth.middleware.test.ts`
  - [x] Verify all 7+ tests pass
  - [x] Check coverage: `npm test -w apps/api -- --coverage auth.middleware`
  - [x] Ensure 100% coverage for middleware

- [x] Manual middleware testing (AC: end-to-end verification)
  - [x] Start API: `npm run dev -w apps/api`
  - [x] Create test route temporarily: `router.get('/test-protected', authMiddleware, (req, res) => res.json({ user: req.user }))`
  - [x] Register and login to get valid JWT token
  - [x] Test protected route with valid token → expect 200 + user data
  - [x] Test protected route without Authorization header → expect 401
  - [x] Test protected route with malformed header → expect 401
  - [x] Test protected route with invalid token → expect 401
  - [x] Verify `req.user.id` and `req.user.email` are accessible in handler
  - [x] Remove test route after verification

- [x] Code quality checks (AC: linting and formatting)
  - [x] Run: `npm run lint -w apps/api`
  - [x] Fix any linting errors
  - [x] Run: `npm run format -w apps/api` (if available)
  - [x] Verify no TypeScript errors: `npm run typecheck -w apps/api` (if available)

## Definition of Done

- [x] All tasks completed and checked off
- [x] JWT authentication middleware implemented with comprehensive error handling
- [x] Express Request interface extended with user property (TypeScript types)
- [x] Middleware extracts token, verifies, and attaches user to req.user
- [x] All error cases handled with appropriate 401 responses
- [x] Unit tests pass with 100% middleware coverage (7+ tests)
- [x] Manual testing confirms all acceptance criteria met
- [x] No linting, formatting, or TypeScript errors
- [x] Middleware ready for use in protected routes (future stories)
- [x] Documentation and usage examples provided in code comments
- [x] Ready for code review (run `code-review` workflow to mark as review)

## Dev Agent Guardrails

**CRITICAL: What the developer MUST follow:**

1. **Never log JWT tokens** - Tokens are sensitive credentials; logging them is a security vulnerability
2. **Return generic error messages** - Don't reveal if token is invalid vs expired (prevents timing attacks)
3. **Extend Express types properly** - Use global namespace declaration, not interface merging hacks
4. **Don't call next(error)** - This middleware sends 401 responses directly, not through error middleware
5. **Validate Authorization header format** - Check for "Bearer " prefix before extracting token
6. **Handle all edge cases** - Missing header, malformed format, empty token, invalid token, expired token
7. **Use req.user consistently** - Always structure as `{ id: number; email: string }` for downstream handlers
8. **Test all error paths** - Don't just test the happy path; 401 scenarios are critical
9. **Follow established patterns** - Use standardized error response format from Stories 1-3 and 1-4
10. **Keep middleware lightweight** - No database queries, no heavy operations, just token verification

**Common Pitfalls to Avoid:**
- ❌ Don't use `req.user = decoded` directly (decoded has `userId`, not `id`)
- ❌ Don't call `next()` after sending response (causes "headers already sent" error)
- ❌ Don't throw errors in middleware (send 401 response directly)
- ❌ Don't use `any` type for `req.user` (defeats TypeScript safety)
- ❌ Don't forget to handle malformed "Bearer" header (e.g., "Bearer" without token)
- ❌ Don't make middleware async unless necessary (JWT verification is synchronous)

**Architecture Compliance Checklist:**
- ✅ Middleware uses `verifyToken()` from `utils/jwt.ts` (don't re-implement verification)
- ✅ Error responses follow standardized format: `{ error: { code, message }, meta: { requestId, timestamp } }`
- ✅ TypeScript strict mode enabled (no `any`, no type assertions without reason)
- ✅ Files follow kebab-case naming convention (`auth.middleware.ts`, not `authMiddleware.ts`)
- ✅ Tests colocated with source (`auth.middleware.test.ts` in same directory)
- ✅ 80% minimum code coverage (aim for 100% on middleware)

## Notes

**Security Considerations:**
- Middleware doesn't load user from database (relies solely on JWT payload for performance)
- For sensitive operations, re-verify user existence in database within route handler
- JWT expiration handled by `verifyToken()` utility (7-day expiration from Story 1-4)
- Consider rate limiting on protected routes to prevent token guessing attacks (post-MVP)

**Performance Considerations:**
- Middleware is synchronous and fast (JWT verification is cryptographic, no I/O)
- No database queries in middleware (user context from JWT payload only)
- For high-traffic routes, consider caching verified tokens in Redis (post-MVP optimization)

**Future Enhancements (Post-MVP):**
- Add role-based access control (RBAC) middleware extending this base auth middleware
- Implement refresh token validation middleware
- Add request context logging with user ID for observability
- Add optional database user lookup for critical operations

**Testing Strategy:**
- Unit tests mock `verifyToken()` to isolate middleware logic
- Integration tests will be added in future stories when protected routes are implemented
- Manual testing validates TypeScript types and end-to-end flow

## Related Stories

- **Depends on:** Story 1-4 (User Login with JWT) - requires `verifyToken()` utility and JWT generation
- **Blocks:** Story 1-6 (User Profile Management) - profile routes will use this middleware
- **Related to:** Story 1-7 (User Logout) - logout will work with this middleware for token invalidation
- **Related to:** Story 1-9 (Protected Routes and Navigation) - frontend will send tokens this middleware validates

## References

- **Project Context:** `_bmad-output/project-context.md` (JWT Authentication Pattern, API Response Format)
- **Epic Source:** `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.5)
- **Architecture:** See ARCH12 (JWT with bcrypt for authentication), ARCH17 (RESTful API standards)
- **Previous Story:** `_bmad-output/implementation-artifacts/1-4-implement-user-login-with-jwt.md` (JWT utilities)
- **NFRs:** NFR20-NFR23 (Security requirements), NFR45 (Performance requirements)

---

**Generated:** 2026-01-06T15:20:45.872Z  
**Story ID:** 1-5  
**Story Key:** 1-5-implement-jwt-authentication-middleware  
**Epic:** 1 (Project Foundation & Authentication)  
**Sprint Status:** ready-for-dev

**Ultimate context engine analysis completed - comprehensive developer guide created**

## Dev Agent Record

### Implementation Plan
- Created Express Request type extension in `apps/api/src/types/express.d.ts` to add optional `user` property
- Implemented JWT authentication middleware in `apps/api/src/middleware/auth.middleware.ts` with comprehensive error handling
- All error responses follow standardized format with requestId and timestamp
- Middleware extracts "Bearer <token>", verifies using `verifyToken()`, and attaches `{ id, email }` to `req.user`

### Implementation Notes
- Used Vitest (not Jest) for testing - replaced `jest.mock()` with `vi.mock()` and `jest.fn()` with `vi.fn()`
- Fixed edge case: "Bearer " (with trailing space but no token) now correctly returns 401 "Invalid authorization format"
- Middleware validates both token presence AND non-empty token value before calling verifyToken()
- All 7 unit tests pass, covering: valid token, missing header, malformed header, invalid token, expired token, empty token, meta fields

### Files Changed
- **Created:** `apps/api/src/types/express.d.ts` - Express Request type extension
- **Created:** `apps/api/src/middleware/auth.middleware.ts` - JWT authentication middleware
- **Created:** `apps/api/src/middleware/auth.middleware.test.ts` - Comprehensive unit tests (7 tests, 100% coverage)

### Test Results
```
✓ src/middleware/auth.middleware.test.ts (7 tests) 7ms
  ✓ authMiddleware (7)
    ✓ should attach user to req.user and call next() with valid token
    ✓ should return 401 when Authorization header is missing
    ✓ should return 401 when Authorization header is malformed (no Bearer prefix)
    ✓ should return 401 when verifyToken returns null (invalid token)
    ✓ should return 401 when verifyToken returns null (expired token)
    ✓ should return 401 when Authorization header has Bearer but no token
    ✓ should include requestId and timestamp in meta for all error responses
```

Full test suite: 50 tests passed across all API tests.

### Completion Notes
✅ All acceptance criteria met:
- AC1: Middleware extracts and verifies JWT from Authorization header
- AC2: Returns 401 for missing, malformed, or invalid tokens
- AC3: Attaches `req.user = { id, email }` for valid tokens
- AC4: All tests pass (7/7 middleware tests + full suite regression)

Middleware ready for use in protected routes (Stories 1-6, 1-7, 1-9).

## File List
- `apps/api/src/types/express.d.ts` (new)
- `apps/api/src/middleware/auth.middleware.ts` (new)
- `apps/api/src/middleware/auth.middleware.test.ts` (new)

## Change Log
- **2026-01-06:** Initial implementation of JWT authentication middleware with comprehensive error handling and 100% test coverage
