# 🔐 Pinata Credential Rotation Guide

Pinata credentials should be rotated regularly to maintain security. You can authenticate using either a JWT or an API key/secret pair. This guide walks through generating new credentials and updating your environment.

## 🛠️ Option 1: Generate a JWT (Recommended)
1. Sign in to [Pinata](https://app.pinata.cloud/).
2. Navigate to **API Keys → JWT**.
3. Create a new JWT with `pinFileToIPFS` permissions.
4. Copy the token—this is shown only once.
5. Update `.env.local`:
   ```bash
   PINATA_JWT=your_new_pinata_jwt
   ```
6. Restart the Next.js server to apply the change.

## 🛠️ Option 2: Create API Key + Secret
1. Visit **API Keys → Keys** in the Pinata dashboard.
2. Generate a new API key with the required scopes (`pinFileToIPFS`, `data:read`).
3. Copy the key and secret values.
4. Update `.env.local`:
   ```bash
   PINATA_API_KEY=your_pinata_api_key
   PINATA_API_SECRET=your_pinata_api_secret
   ```
5. Remove any existing `PINATA_JWT` entry to avoid ambiguity.

## ✅ Post-Rotation Checklist
- [ ] Update `.env.local` or deployment secrets with the new credentials.
- [ ] Redeploy or restart your application.
- [ ] Visit `http://localhost:3000/api/test-pinata` to confirm authentication succeeds.
- [ ] Upload a test file to verify real CIDs are issued.

## 🧼 Clean Up Old Credentials
Once the new credentials are verified:
- Delete or revoke old JWTs and API keys in the Pinata dashboard.
- Remove unused entries from your environment files and secret managers.

## 📎 Tips
- Store credentials securely using a secret manager (e.g., 1Password, Vault, AWS Secrets Manager).
- Restrict credentials to the minimum required permissions.
- Rotate credentials on a regular schedule or immediately after suspected exposure.

Keeping your Pinata credentials current ensures reliable IPFS uploads and protects your evidence pipeline.