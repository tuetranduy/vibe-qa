# @vibe-qa/database

Database package for Vibe QA - Prisma ORM and MySQL schema management.

## Installation

This package is part of the Vibe QA monorepo. All dependencies are managed at the root level.

## Database Schema

Current schema includes:
- **User** model: id, email (unique), password, name, createdAt, updatedAt

## Migration Commands

```bash
# Create and apply a new migration
cd packages/database
npx prisma migrate dev --name <migration-name>

# Apply existing migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

## Environment Variables

Required in root `.env` file:

```
DATABASE_URL="mysql://root:rootpassword@localhost:3306/vibeqa"
```

## Usage

```typescript
import { prisma } from '@vibe-qa/database';

// Query example
const users = await prisma.user.findMany();

// Always close connection when done
await prisma.$disconnect();
```

## Development

```bash
# Build package
npm run build

# Watch mode
npm run dev
```

## Notes

- All schema changes must go through Prisma migrations
- Never edit the database schema manually
- Prisma Client is automatically generated on `npm install` (postinstall hook)
- Connection pooling is handled automatically by Prisma
