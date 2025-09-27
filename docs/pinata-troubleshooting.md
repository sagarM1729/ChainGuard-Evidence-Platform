# 🔧 Pinata Upload Troubleshooting Guide

## Problem
You may encounter authentication or connectivity errors when uploading evidence files to Pinata:
- `401 Unauthorized` or `403 Forbidden` responses from `pinning/pinFileToIPFS`
- Uploads falling back to development CIDs instead of real IPFS hashes
- Evidence downloads returning gateway errors

## ✅ Applied Fixes

### 1. Validated Pinata Auth Headers
**File**: `src/lib/pinata-client.ts`
- ✅ Supports both JWT and API key/secret authentication
- ✅ Ensures credentials are present during client construction
- ✅ Provides expressive errors when credentials are missing

### 2. Hardened Upload Workflow
**File**: `src/lib/pinata-client.ts`
- ✅ Streams uploads through `pinFileToIPFS`
- ✅ Adds metadata and CID version settings
- ✅ Falls back to deterministic mock CIDs when Pinata is unreachable

### 3. Updated Evidence Manager Integration
**File**: `src/services/evidenceManager.ts`
- ✅ Uses Pinata client for uploads and downloads
- ✅ Logs detailed integrity checks for diagnostics
- ✅ Rebuilds Merkle proofs even when uploads fall back

### 4. Diagnostic Endpoints
**Files**:
- `src/app/api/test-pinata/route.ts`
- `src/app/api/test-pinata-debug/route.ts`

These routes help you verify authentication and inspect response payloads without leaving the browser.

## 🔍 Testing Your Setup

### Step 1: Verify Pinata Connection
1. Start the app: `npm run dev`
2. Log in with an authorized user
3. Visit `http://localhost:3000/api/test-pinata`
4. Confirm `success: true` and inspect the returned account details

### Step 2: Run Debug Endpoint (Optional)
1. Visit `http://localhost:3000/api/test-pinata-debug`
2. Review the JSON payload for rate limits or credential issues

### Step 3: Upload Evidence
1. Create or open a case from the dashboard
2. Upload a file using the evidence form
3. Watch the browser console for `Pinata upload successful` messages
4. Open the stored CID to confirm retrieval through your gateway

## 🛠️ If Issues Persist

### Check Environment Variables
Ensure `.env.local` includes one of the following:
```bash
# Recommended
PINATA_JWT=your_pinata_jwt_here

# Alternative
PINATA_API_KEY=your_pinata_api_key_here
PINATA_API_SECRET=your_pinata_api_secret_here

# Optional custom gateway
# PINATA_GATEWAY_URL=https://your-gateway.example.com/ipfs
```

### Validate Credentials
- JWTs should start with `eyJ` and remain unmodified
- API keys and secrets must be copied exactly from the Pinata dashboard

### Inspect Logs
Look for these success messages:
- ✅ `Server-side Pinata upload started`
- ✅ `Server-side Pinata upload successful`
- ✅ `Complete evidence integrity check`

If uploads fall back to a development CID, verify network connectivity and credentials before retrying.

## 🎯 Expected Results
- ✅ Evidence uploads succeed with real Pinata CIDs
- ✅ Dashboard downloads resolve through the configured gateway
- ✅ Merkle ledger snapshots remain consistent
- ✅ Fallback CIDs appear only when Pinata is unavailable

## 🔄 Fallback Behavior
When Pinata is unreachable, the system:
- Generates deterministic mock CIDs for local testing
- Stores evidence metadata in PostgreSQL regardless of provider status
- Surfaces clear warnings in both server and browser logs

With these safeguards, the ChainGuard Evidence Platform remains resilient even if Pinata experiences a temporary outage.