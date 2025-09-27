# 📦 Pinata Storage Playbook

This playbook captures everything you need to keep ChainGuard’s Pinata integration healthy.

## 🔑 Environment variables
Update `.env.local` (or your deployment secrets) with one of the following authentication options:

```bash
PINATA_JWT=your_pinata_jwt_here
# or
PINATA_API_KEY=your_pinata_api_key_here
PINATA_API_SECRET=your_pinata_api_secret_here

# Optional gateway override
# PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

## 🛠️ Core files
- `src/lib/pinata-client.ts`
- `src/services/evidenceManager.ts`
- `src/lib/ipfs-upload.ts`
- `src/app/api/test-pinata/route.ts`
- `src/app/api/test-pinata-debug/route.ts`

## 🧪 Smoke tests
1. Run `npm run dev`
2. Hit `http://localhost:3000/api/test-pinata`
3. Upload evidence from the dashboard and open the returned CID via the gateway
4. Optionally run:
   - `npx tsx scripts/upload-test.ts`
   - `npx tsx scripts/upload-single-test.ts`
   - `npx tsx scripts/test-pinata-direct.ts`

## 🚨 Common issues
| Symptom | Cause | Fix |
| --- | --- | --- |
| 403 `NO_SCOPES_FOUND` | API key missing `pinFileToIPFS` scope | Regenerate key with correct permissions |
| Upload falls back to `dev-` CID | Pinata offline or credentials invalid | Re-run `/api/test-pinata`, refresh env vars |
| Gateway timeout | Default gateway rate limited | Set `PINATA_GATEWAY_URL` to a dedicated gateway |

## 🔄 Credential hygiene
- Rotate JWTs/API keys regularly
- Revoke unused credentials in the Pinata dashboard
- Store secrets in a managed vault (1Password, Vault, AWS Secrets Manager, etc.)

## ✅ After rotating credentials
- Update `.env.local` and deployment secrets
- Restart the Next.js server or redeploy
- Re-run `npx tsx scripts/upload-test.ts` to verify real CIDs are issued

Pinata is the only storage provider in ChainGuard. Keep these checks handy and you’ll maintain reliable evidence uploads.