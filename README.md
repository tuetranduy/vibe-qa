# Vibe QA

AI-Powered Automated Testing Platform built with Turborepo.

## Getting Started

### Prerequisites

- Node.js 18+ with npm
- Docker and Docker Compose

### Installation

```bash
# Install dependencies
npm install

# Start Docker containers (MySQL & Redis)
docker-compose up -d

# Build all packages
npm run build

# Start development servers
npm run dev
```

### Development

- **Web App**: http://localhost:5173 (React + Vite)
- **API Server**: http://localhost:3001 (Express)
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

### Project Structure

```
vibe-qa/
├── apps/
│   ├── web/              # React frontend (Vite + TypeScript)
│   └── api/              # Express backend (TypeScript)
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── ai-client/        # AI provider abstraction
│   ├── test-engine/      # Playwright wrapper
│   └── database/         # Prisma client
├── docker-compose.yml
├── turbo.json
└── package.json
```

### Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run test` - Run all tests

### Technology Stack

- **Monorepo**: Turborepo 2.x
- **Frontend**: React 18 + Vite 5 + TypeScript 5
- **Backend**: Express 4 + TypeScript 5
- **Database**: MySQL 8
- **Cache**: Redis 7
- **Package Manager**: npm workspaces

## License

Private
