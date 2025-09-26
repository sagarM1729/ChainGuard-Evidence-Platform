# 🚀 ChainGuard Evidence Platform - Startup Guide

## 🎯 Private Repository - Ready to Run!

This repository ships with everything you need to run the Next.js application and supporting utilities locally.

### ✨ Fresh Clone Setup (First Time)
```bash
git clone https://github.com/sagarM1729/ChainGuard-Evidence-Platform.git
cd ChainGuard-Evidence-Platform
git checkout connect_backend
npm install
```

### 🚀 Quick Start (Every Time)
```bash
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000) by default.

### 🧪 Optional: Smoke-Test the Stack

Run the lightweight three-tier smoke test to confirm Prisma connectivity and Merkle proof generation:

```bash
node test-integration.js
```

### 🛠️ Troubleshooting

- Ensure environment variables in `.env.local` (database, email, storage) are valid.
- Confirm Prisma migrations are applied with `npx prisma migrate deploy`.
- Restart the dev server after updating environment configuration.

---

## 🎉 Your Evidence Platform is Now Production-Ready!

Access your application: **http://localhost:3000**

**Login Credentials:** Use your registered account or create a new one via the signup page.
