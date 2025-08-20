# ChainGuard Evidence Platform

Monorepo-style Next.js (App Router) application for secure evidence management leveraging Prisma, PostgreSQL, Hyperledger Fabric, IPFS (web3.storage), and AI assisted search.

## Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js (credentials placeholder)
- Zustand state management
- Cypress (E2E) & Jest / Testing Library (unit + integration)
- next-pwa for offline support
- Hyperledger Fabric (chaincode + network config)
- web3.storage (IPFS)

## Getting Started
1. Install dependencies
2. Provide environment variables
3. Setup database & run migrations
4. Start dev server

### 1. Install
```
npm install
```

### 2. Environment (.env.local)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/chainguard
NEXTAUTH_SECRET=replace_me
NEXTAUTH_URL=http://localhost:3000
WEB3_STORAGE_TOKEN=replace_me
```

### 3. Prisma
```
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Dev
```
npm run dev
```

Visit http://localhost:3000

### Tests
```
npm run test
npm run cypress
```

### Lint & Types
```
npm run lint
npm run typecheck
```

## PWA
Manifest configured in `public/manifest.json`. Service worker via next-pwa (disabled in dev).

## Blockchain
See `blockchain/` for chaincode, scripts, and network configuration placeholders.

## TODO Roadmap (Early Stage)
- Implement real auth with hashed passwords
- Evidence upload & IPFS integration
- AI search endpoint
- Smart contract implementation
- Role-based access control

---
Scaffold generated; replace placeholders as functionality is implemented.
