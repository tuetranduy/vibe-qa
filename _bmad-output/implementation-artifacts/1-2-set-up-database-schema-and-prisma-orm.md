# Story 1.2: Set Up Database Schema and Prisma ORM

Status: review

## Story

As a **developer**,
I want **Prisma configured with User table in the database package**,
So that **I can persist user account data for authentication**.

## Acceptance Criteria

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

## Tasks / Subtasks

- [x] Install Prisma dependencies in database package (AC: 1)
  - [x] Add `prisma` as devDependency (CLI tool)
  - [x] Add `@prisma/client` as dependency (generated client)
  - [x] Run `npx prisma init` in packages/database directory
- [x] Configure Prisma schema file (AC: 2-3)
  - [x] Set datasource to MySQL provider
  - [x] Configure database URL from environment variable
  - [x] Define User model with all required fields
  - [x] Add unique constraint on email field
  - [x] Add createdAt and updatedAt with @default and @updatedAt
- [x] Create initial migration (AC: 4)
  - [x] Run `npx prisma migrate dev --name init`
  - [x] Verify migration file created in prisma/migrations/
  - [x] Verify User table created in MySQL database
  - [x] Document migration commands in package README
- [x] Export Prisma Client from database package (AC: 5)
  - [x] Create src/index.ts that exports PrismaClient instance
  - [x] Configure singleton pattern for client instance
  - [x] Add TypeScript types export
  - [x] Update package.json with proper exports field
- [x] Configure database package build (AC: 5)
  - [x] Add postinstall script to generate Prisma Client
  - [x] Update tsconfig.json to include generated types
  - [x] Add build script that generates client
  - [x] Test package builds successfully with turbo
- [x] Integrate with API app (AC: 6)
  - [x] Install @vibe-qa/database in apps/api
  - [x] Import PrismaClient in API entry point
  - [x] Test database connection on startup
  - [x] Add health check endpoint that queries database
- [x] Add connection configuration (AC: 7)
  - [x] Create .env.example with DATABASE_URL template
  - [x] Document connection string format
  - [x] Add connection pooling configuration
  - [x] Test connection with docker-compose MySQL

## Dev Notes

### Architecture & Technical Requirements

**Database Technology:**
- **Database:** MySQL 8+ (from docker-compose.yml in Story 1.1)
- **ORM:** Prisma (latest stable version, 5.x+)
- **Package:** `packages/database` owns all schema and migrations
- **Connection:** Via DATABASE_URL environment variable
- **Pooling:** Prisma handles connection pooling automatically

**Prisma Configuration:**
- Schema location: `packages/database/prisma/schema.prisma`
- Generated client location: `node_modules/.prisma/client` (auto-managed)
- Migrations directory: `packages/database/prisma/migrations/`
- Database provider: `mysql`

**User Model Schema:**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // Will store bcrypt hash
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Fields Explained:**
- `id`: Auto-incrementing primary key (INT in MySQL)
- `email`: Unique identifier for login, must have unique constraint
- `password`: Will store bcrypt hash (NOT plaintext) - length 60 chars for bcrypt
- `name`: User's display name
- `createdAt`: Automatically set on record creation
- `updatedAt`: Automatically updated on record modification

### Critical Implementation Rules

**From Project Context:**
1. **Never install dependencies in individual packages** - Use root `npm install` with workspace filtering
2. **Database package owns Prisma** - All other packages/apps import from `@vibe-qa/database`
3. **Never edit DB schema manually** - Always use Prisma migrations
4. **Connection string security** - Never commit real credentials, use .env files
5. **Migration workflow:**
   - Development: `npx prisma migrate dev` (creates and applies)
   - Production: `npx prisma migrate deploy` (only applies existing)

**Prisma Best Practices:**
- Always generate client after schema changes
- Use singleton pattern for PrismaClient to avoid connection exhaustion
- Add `@map` and `@@map` if MySQL table names differ from model names (not needed here)
- Include `binaryTargets` in schema for Docker deployment (add later if needed)

**Package Export Pattern:**
```typescript
// packages/database/src/index.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };
export * from '@prisma/client'; // Export types
```

**Integration with API:**
```typescript
// apps/api/src/index.ts
import { prisma } from '@vibe-qa/database';

// Test connection
await prisma.$connect();
console.log('Database connected successfully');
```

### Previous Story Learnings (from 1.1)

**From Story 1.1 Completion Notes:**
- Turborepo uses `tasks` field (not legacy `pipeline`) in turbo.json
- Package manager field required for Turbo 2.7.3+: `"packageManager": "npm@10.x"`
- Use tsx for TypeScript execution (faster than ts-node)
- All tests should use Vitest for consistency
- Docker containers must be running before API starts
- Hot reload verified and working

**File Structure Established:**
```
packages/database/
├── prisma/
│   └── schema.prisma
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Connection String Format (from docker-compose.yml):**
```
DATABASE_URL="mysql://root:rootpassword@localhost:3306/vibeqa"
```

### Code Quality & Testing

**Testing Strategy:**
- Unit tests for database package not required in MVP (Prisma is tested)
- Integration tests will verify database operations in API endpoints
- Manual verification: Run simple query after setup to confirm connection
- Add health check endpoint in API that uses Prisma to verify connection

**TypeScript Configuration:**
- Strict mode enabled (from root tsconfig.json)
- Include Prisma generated types in compilation
- No `any` types allowed

**Error Handling:**
- Prisma Client throws typed errors (PrismaClientKnownRequestError, etc.)
- Wrap database calls in try-catch in API handlers
- Log connection errors at startup (fatal if cannot connect)

### Environment & Configuration

**Environment Variables Required:**
```bash
# .env file at project root
DATABASE_URL="mysql://root:rootpassword@localhost:3306/vibeqa"
```

**Development Setup:**
1. Ensure MySQL container running: `docker-compose up -d mysql`
2. Install dependencies: `npm install prisma @prisma/client -w packages/database`
3. Initialize Prisma: `cd packages/database && npx prisma init`
4. Define schema in prisma/schema.prisma
5. Create migration: `npx prisma migrate dev --name init`
6. Generate client: `npx prisma generate`
7. Build package: `turbo run build --filter=@vibe-qa/database`

**Turborepo Integration:**
- Add `generate` task to turbo.json (runs prisma generate)
- Build task should depend on generate task
- Dev task should regenerate client on schema changes

### Project Structure Notes

**Alignment with Unified Structure:**
- Database package follows monorepo pattern from Story 1.1
- Workspace name: `@vibe-qa/database` (consistent with naming convention)
- Referenced via workspace protocol in API: `"@vibe-qa/database": "workspace:*"`
- No relative path imports outside workspace

**Integration Points:**
- `apps/api` imports PrismaClient from `@vibe-qa/database`
- Future packages (if needed) also import from centralized package
- Shared types for User model can be exported from shared-types package later

### References

- [Project Context: Database Rules](_bmad-output/project-context.md#database--orm-rules)
- [Architecture: Database Package Architecture](_bmad-output/planning-artifacts/architecture.md#database-package-architecture)
- [Architecture: MySQL Configuration](_bmad-output/planning-artifacts/architecture.md#infrastructure)
- [Epic 1.2: Set Up Database Schema](_bmad-output/planning-artifacts/epics.md#story-12-set-up-database-schema-and-prisma-orm)
- [Previous Story: 1.1 Monorepo Setup](_bmad-output/implementation-artifacts/1-1-initialize-turborepo-monorepo-structure.md)

### Latest Technology Versions (as of 2026-01-06)

**Prisma Version:**
- Prisma 5.x (latest stable with improved type safety and performance)
- Major features: Better TypeScript integration, enhanced query performance
- Breaking changes from 4.x: Check migration guide if needed

**MySQL 8 Compatibility:**
- Prisma fully supports MySQL 8
- Uses `mysql` provider (not `mysql_old`)
- Connection pooling configured automatically by Prisma

**Installation Commands:**
```bash
# From project root
npm install prisma @prisma/client -w packages/database
```

**Prisma Commands Reference:**
```bash
# Initialize (creates schema and .env)
npx prisma init

# Create migration and apply to database
npx prisma migrate dev --name <migration-name>

# Apply existing migrations (production)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI for database)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Success Criteria Checklist

After completing this story, verify:
- [ ] Prisma installed in packages/database
- [ ] schema.prisma file exists with User model
- [ ] User model has all required fields: id, email (unique), password, name, createdAt, updatedAt
- [ ] DATABASE_URL environment variable configured
- [ ] Initial migration created: `prisma/migrations/<timestamp>_init/migration.sql`
- [ ] Migration applied to MySQL: User table exists in database
- [ ] Prisma Client generated successfully
- [ ] Database package exports PrismaClient
- [ ] apps/api can import from @vibe-qa/database
- [ ] Database connection works (API connects on startup)
- [ ] `turbo run build` succeeds for database package
- [ ] No TypeScript errors in database package
- [ ] .env.example created with DATABASE_URL template
- [ ] MySQL container running and accessible

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-06)

### Debug Log References

N/A - All tasks completed successfully on first iteration.

### Completion Notes List

**Prisma Version:**
- Installed Prisma 5.22.0 (latest stable 5.x as per Dev Notes requirement)
- Initially encountered Prisma 7.x which uses different config approach (prisma.config.ts)
- Downgraded to 5.22.0 for stability and proper schema.prisma support with `url = env("DATABASE_URL")`

**Database Schema:**
- User model created with all required fields: id (INT auto-increment), email (unique), password, name, createdAt, updatedAt
- Migration 20260106143854_init successfully applied to MySQL database
- Verified table structure in MySQL: User table exists with correct schema

**Package Configuration:**
- Added exports field to package.json for proper ESM module resolution
- Configured postinstall script to auto-generate Prisma Client
- Fixed tsconfig.json to enable emit (root had noEmit: true)
- Build process: `npx prisma generate && tsc`

**API Integration:**
- Updated apps/api/src/index.ts with database connection on startup
- Enhanced /health endpoint to test database connectivity
- Verified API starts successfully and connects to MySQL
- Health check returns: `{ status: "ok", database: "connected" }`

**Environment Configuration:**
- Created .env and .env.example at project root
- DATABASE_URL configured for MySQL container: `mysql://root:rootpassword@localhost:3306/vibeqa`
- Documented connection string format in README.md

**Testing:**
- Verified turbo build succeeds for @vibe-qa/database package
- Confirmed API can import and use @vibe-qa/database package
- Validated database connection works end-to-end
- MySQL User table verified via docker exec command

### File List

- `packages/database/prisma/schema.prisma` - Created User model schema
- `packages/database/prisma/migrations/20260106143854_init/migration.sql` - Initial migration
- `packages/database/src/index.ts` - Modified to export Prisma Client singleton
- `packages/database/package.json` - Modified: added Prisma deps, exports field, postinstall script
- `packages/database/tsconfig.json` - Modified: added noEmit: false override
- `packages/database/README.md` - Created with migration commands and usage docs
- `apps/api/src/index.ts` - Modified: added database import, connection test, enhanced health check
- `.env` - Created with DATABASE_URL
- `.env.example` - Created with DATABASE_URL template
