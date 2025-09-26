# 🚀 ChainGuard Evidence Platform - Deployment Guide

## 🎯 Overview

ChainGuard is a three-tier evidence platform built with Next.js, Prisma, and a lightweight Merkle ledger that derives tier-two integrity proofs from deterministic Merkle trees computed from your PostgreSQL records.

## 🧱 Architecture at a Glance

| Tier | Purpose | Technology |
| --- | --- | --- |
| 1 | Metadata index | PostgreSQL via Prisma |
| 2 | Integrity notary | TypeScript Merkle ledger (`src/lib/merkle.ts`) |
| 3 | Evidence vault | Pinata/IPFS with development fallback |

## ⚙️ Prerequisites

- Node.js 18+
- PostgreSQL database URL (Neon works great)
- Pinata credentials (JWT or API key + secret)
- Resend API key for transactional emails

## 📦 First-Time Setup

```bash
# Clone repository
git clone https://github.com/sagarM1729/ChainGuard-Evidence-Platform.git
cd ChainGuard-Evidence-Platform

# Install dependencies
npm install

# Apply database schema
npx prisma generate
npx prisma migrate dev
```

Copy `.env.example` to `.env.local` and fill in database, Pinata, and email values. Tier-two Merkle ledger does **not** require any environment variables.

## 🚀 Daily Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in or register. Evidence uploads will:

1. Persist metadata to PostgreSQL
2. Compute SHA-256 hash and update the case Merkle root
3. Upload files via Pinata/IPFS (or mock CID fallback)

## ✅ Verifying the Three Tiers

1. **Tier 1 (Postgres)** – run `npx prisma studio` and inspect `Case` and `Evidence` tables.
2. **Tier 2 (Merkle)** – run `npm run test` to execute `src/lib/merkle.test.ts` or check `Case.merkleRoot` after an upload.
3. **Tier 3 (IPFS)** – upload a file through the dashboard and open the generated retrieval URL.

## 🔐 Production Notes

- Generate a strong `NEXTAUTH_SECRET` with `openssl rand -base64 32`.
- Use managed PostgreSQL with automatic backups.
- Point `NEXTAUTH_URL` to your HTTPS domain.
- Rotate Pinata credentials periodically.
- Re-run `npx prisma migrate deploy` during deployments.

## 🛟 Troubleshooting

- **Pinata auth errors** → verify `PINATA_JWT` or API key/secret in `.env.local`.
- **Merkle root missing** → ensure migrations applied; run `npm run dev` and upload new evidence to regenerate.
- **Type errors after pulling changes** → run `npm install` and `npx prisma generate`.

## 📦 Deployment Automation

For CI/CD pipelines:

```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start
```

The Merkle ledger requires no external services, making container deployments significantly faster than blockchain-based setups.

---

**Ready to ship?** Deploy knowing your three-tier storage is lightweight, deterministic, and cloud friendly. 🌐