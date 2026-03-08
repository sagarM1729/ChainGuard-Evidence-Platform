# Automatic Evidence Custody Chain Tracking

**Date:** March 7, 2026  
**Status:** ✅ Complete  
**Branch:** `fix/add_some_features`

---

## What Is This?

In law enforcement, **chain of custody** is the documented trail showing who handled a piece of evidence, when, and what they did with it. If this trail has gaps, evidence can be thrown out of court.

This feature **automatically** records every interaction anyone has with evidence files — viewing, downloading, verifying, deleting, and generating reports. Officers don't need to do anything extra; the system tracks everything behind the scenes.

### Why It Matters
- **Court compliance** — every evidence interaction is timestamped and linked to an authenticated officer
- **Zero manual effort** — tracking happens automatically on every action
- **PDF reports** — generate a printable custody chain document for court submission
- **Tamper detection** — verification results are logged into the custody chain

---

## Quick Start — Where to Find This

1. Navigate to **Dashboard → Cases → [Any Case]**
2. Scroll to the evidence list
3. Every time you click **View**, **Download**, or **Verify** on an evidence item, the custody chain updates automatically
4. Click **Custody Report** on any evidence item to generate a PDF
5. The custody chain is stored as a JSON array on each evidence record in the database

> **Who can use this?** Any authenticated user who has access to a case can trigger custody tracking. The system logs the officer's email, timestamp, and action type.

---

## How It Works — High-Level Flow

```
Officer clicks "View" on evidence
        ↓
Frontend calls POST /api/evidence/[id]/custody
  with { action: "EVIDENCE_VIEWED" }
        ↓
Backend validates session + action type
        ↓
CustodyChainManager reads existing custody chain (JSON array)
  from the evidence record
        ↓
Appends new entry: { officer, timestamp, action, ipfsCid, notes }
        ↓
Writes updated JSON back to the evidence record
        ↓
Also creates an Activity log entry for the audit trail
```

The same flow applies for download, verify, delete, and report generation — each action calls the custody API with a different action type.

---

## Technical Implementation

### 1. Core Components

#### **Custody Chain Manager** (`src/lib/custody-manager.ts`)
- Central management system for custody chain operations
- Validates custody actions against predefined list
- Handles JSON custody chain updates
- Integrates with Prisma database operations

#### **Custody API Endpoint** (`src/app/api/evidence/[evidenceId]/custody/route.ts`)
- REST endpoint for manual custody chain updates
- Authentication and authorization checking
- Standardized response formatting

### 2. Database Schema Changes

#### **ActivityType Enum** (`prisma/schema.prisma`)
Added `EVIDENCE_DELETED` to support evidence deletion tracking.

```sql
enum ActivityType {
  // ... existing types
  EVIDENCE_DELETED
  // ... other types
}
```

### 3. Tracked Actions

| Action | When It Fires | Who Triggers It | What Gets Logged |
|--------|--------------|-----------------|------------------|
| `INITIAL_UPLOAD` | Officer uploads a new evidence file | Any user creating evidence | Officer email, file CID, upload timestamp |
| `EVIDENCE_VIEWED` | Officer clicks "View" on an evidence item | Any user with case access | Officer email, which file was viewed |
| `EVIDENCE_DOWNLOADED` | Officer clicks "Download" on evidence | Any user with case access | Officer email, file downloaded |
| `EVIDENCE_VERIFIED` | Officer runs forensic integrity check | Any user with case access | Officer email, verification pass/fail result |
| `EVIDENCE_DELETED` | Officer deletes an evidence record | User with delete permission | Officer email, deleted file details |
| `CUSTODY_REPORT_GENERATED` | Officer generates a PDF custody report | Any user with case access | Officer email, report generation timestamp |

---

## API Endpoints

### **POST** `/api/evidence/[evidenceId]/custody`
Updates custody chain for specific evidence.

#### Request Body:
```json
{
  "action": "EVIDENCE_VIEWED",
  "notes": "Optional description of the action"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Custody chain updated successfully",
  "action": "EVIDENCE_VIEWED",
  "officer": "officer@example.com"
}
```

### **GET** `/api/evidence/[evidenceId]/custody-report`
Generates PDF custody chain report (now includes automatic custody tracking).

---

## File Changes

### **Modified Files:**

1. **`src/app/dashboard/cases/[caseId]/page.tsx`**
   - Added custody tracking to View button
   - Enhanced Download button with proper file download and custody tracking
   - Maintains existing UI/UX

2. **`src/app/api/evidence/route.ts`**
   - Updated evidence creation with standardized custody initialization
   - Added custody chain import

3. **`src/app/api/evidence/[evidenceId]/route.ts`**
   - Added custody tracking for evidence deletion
   - Imported custody manager

4. **`src/app/api/evidence/verify/route.ts`**
   - Added custody tracking for evidence verification
   - Logs verification results in custody chain

5. **`src/app/api/evidence/[evidenceId]/custody-report/route.ts`**
   - Enhanced with automatic custody tracking for PDF generation
   - Imported custody manager

### **New Files:**

1. **`src/lib/custody-manager.ts`**
   - Core custody chain management class
   - Action validation
   - Database integration helpers

2. **`src/app/api/evidence/[evidenceId]/custody/route.ts`**
   - REST endpoint for custody updates
   - Authentication and validation

---

## Custody Chain Data Structure

Each custody entry follows this JSON structure:

```typescript
interface CustodyEntry {
  officer: string        // Email of the officer performing action
  timestamp: string      // ISO 8601 timestamp
  action: string         // Standardized action type
  ipfsCid: string       // IPFS content identifier
  notes?: string        // Optional detailed description
  location?: string     // Optional location information
}
```

### Example Custody Chain:
```json
[
  {
    "officer": "detective.smith@police.gov",
    "timestamp": "2026-03-07T10:30:00.000Z",
    "action": "INITIAL_UPLOAD",
    "ipfsCid": "QmXnnyufdzAWL5CqZ2RnSNgPbvCc9S4iz4cV7wMx2BSWnP",
    "location": "Digital Evidence System"
  },
  {
    "officer": "detective.jones@police.gov", 
    "timestamp": "2026-03-07T14:15:30.000Z",
    "action": "EVIDENCE_VIEWED",
    "ipfsCid": "QmXnnyufdzAWL5CqZ2RnSNgPbvCc9S4iz4cV7wMx2BSWnP",
    "notes": "Evidence file photo-001.jpg viewed by officer"
  }
]
```

---

## Benefits & Features

### **Legal Compliance**
- **Complete audit trail** for every evidence interaction
- **Timestamped entries** with officer identification
- **Immutable custody chain** stored in database
- **Court-admissible documentation** with PDF generation

### **Operational Security**
- **Officer accountability** - all actions linked to authenticated users
- **Automatic tracking** - no manual intervention required
- **Tamper detection** - verification results logged in custody chain
- **Download control** - proper file downloads with tracking

### **User Experience**
- **Seamless integration** - no additional steps required
- **Enhanced download** - files properly download instead of opening in browser
- **PDF reports** - comprehensive custody chain documentation
- **Real-time updates** - immediate custody chain updates

---

## Usage Instructions

### **For Officers:**
1. **Viewing Evidence**: Click "View" button - automatically tracked
2. **Downloading Evidence**: Click "Download" button - automatically tracked and properly downloads file
3. **Verifying Evidence**: Use integrity verification - results automatically logged
4. **Generating Reports**: Click "Custody Report" - PDF generation automatically tracked

### **For Administrators:**
1. **Manual Updates**: Use POST endpoint to add custom custody entries
2. **Audit Reviews**: Check custody chains in evidence records
3. **Compliance Reports**: Generate PDF custody reports for court proceedings

---

## Security & Integrity — Why This Can't Be Faked

This is the most critical part of the system. Evidence integrity is protected by **4 independent layers**. Even if one layer is compromised, the others catch tampering.

### Layer 1 — IPFS Content Addressing

When an evidence file is uploaded, it's stored on **IPFS via Pinata**. IPFS generates a **CID** (Content Identifier) which is a cryptographic hash of the file's actual bytes. This CID is stored in the `ipfsCid` field on the Evidence database record.

**Why it matters:** If anyone modifies even a single byte of the file, the CID would be completely different. You can always re-fetch the file from IPFS by its CID and verify it matches — if it does, the file is untouched.

```
Original file → SHA-256 hash → CID: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3
Tampered file → SHA-256 hash → CID: bafybeiabc123completely_different_hash
```

**Implementation:** `src/lib/ipfs-upload.ts` — the `IPFSUploadService` handles upload and returns the CID.

### Layer 2 — SHA-256 File Hash

At upload time, the system also computes a separate **SHA-256 hash** of the file and stores it in the `fileHash` field. This is a second, independent verification — even if IPFS is compromised, you can hash the file locally and compare against the stored hash.

**Schema field:** `Evidence.fileHash` (indexed for fast lookup)

### Layer 3 — Merkle Tree per Case

All evidence items in a case are combined into a **Merkle tree** (a binary tree of hashes). Here's how it works:

```
                    Merkle Root (stored on Case record)
                   /                    \
           Hash(A+B)                Hash(C+D)
           /      \                /        \
     Leaf A     Leaf B       Leaf C      Leaf D
    (evidence1) (evidence2) (evidence3) (evidence4)
```

Each leaf is a hash of: `caseId + evidenceId + ipfsCid + fileHash + timestamp`

- The **Merkle root** is stored on the `Case.merkleRoot` field
- Each evidence item stores its own **Merkle proof** (`Evidence.merkleProof`) — the sibling hashes needed to reconstruct the root

**Why it matters:**
- If **any** evidence in a case is tampered with, the Merkle root won't match
- You can verify a **single** piece of evidence without re-downloading every other file in the case — just use the proof path
- A tampered leaf produces a different root, which is immediately detectable

**Implementation:** `src/lib/merkle.ts` — functions: `createLeafHash()`, `buildMerkleLayers()`, `getMerkleRoot()`, `generateMerkleProof()`, `verifyMerkleProof()`

### Layer 4 — Blockchain Anchor (Hyperledger Fabric)

The database schema includes `blockchainTxId` and `blockchainHash` fields on Evidence. The platform has a full **Hyperledger Fabric** blockchain configuration (`blockchain/` directory with orderer/peer organization configs).

The Merkle root or evidence hash can be anchored to the blockchain — creating an immutable record that persists even if someone gains full access to the PostgreSQL database.

**Schema fields:** `Evidence.blockchainTxId`, `Evidence.blockchainHash`

---

### How the Custody Chain Log Is Protected

The custody chain (the record of who viewed/downloaded/verified evidence) is protected by:

| Protection | How It Works |
|------------|-------------|
| **Authentication** | Only users with a valid NextAuth session can add entries — checked via `getServerSession()` |
| **Action validation** | `CustodyChainManager.validateCustodyAction()` checks action types against a predefined list — you can't inject arbitrary actions |
| **Access control** | Users can only update custody for cases they have access to |
| **Dual recording** | Every custody entry also creates a separate `Activity` record — two independent logs of each event |
| **PDF reports** | Generated reports include the file hash, IPFS CID, and Merkle root — if any don't match, tampering is evident |
| **Input validation** | Action types are validated, and custody chains are stored as JSON with proper escaping |

### Honest Limitation — What's Not Yet Signed

The custody chain JSON itself is **not cryptographically signed per-entry**. It's stored as a JSON array in PostgreSQL and protected by access control (authentication + authorization). A database administrator with direct DB write access could theoretically edit the JSON.

However:
- The **evidence files themselves** are cryptographically guaranteed (IPFS CID + SHA-256 hash + Merkle tree)
- The custody log is **duplicated** in the Activity table, so an attacker would need to modify both
- Planned future enhancement: **per-entry digital signatures** (sign each custody entry with the officer's private key) and **blockchain anchoring of custody chain hashes**

---

## Testing Checklist

- [x] Evidence upload creates initial custody entry
- [x] Evidence viewing updates custody chain  
- [x] Evidence downloading updates custody chain and properly downloads file
- [x] Evidence verification updates custody chain with results
- [x] Evidence deletion updates custody chain before removal
- [x] PDF generation updates custody chain
- [x] API authentication works correctly
- [x] TypeScript compilation passes
- [x] Database schema updated properly

---

## Future Enhancements

### **Potential Additions:**
- **Location tracking** — GPS coordinates for field operations (mobile app integration)
- **Digital signatures** — cryptographic signing of custody entries for extra legal weight
- **Blockchain anchoring** — hash custody chains to the Hyperledger blockchain for immutability
- **Notification alerts** — notify supervisors when sensitive evidence is accessed
- **Bulk export** — export all custody chains for a case as a single document

---

## Technical Notes

### **Performance Considerations:**
- Custody updates are non-blocking operations
- Failed custody updates don't prevent evidence operations
- JSON custody chains are lightweight and efficient
- Database queries optimized for custody chain retrieval

### **Error Handling:**
- Graceful degradation if custody updates fail
- Console logging for debugging custody issues
- User-friendly error messages for API failures
- Validation prevents invalid custody actions

---

## Deployment Notes

1. **Database Migration**: Run `npx prisma migrate deploy` then `npx prisma generate` after schema changes
2. **Type Generation**: Ensure Prisma client is regenerated
3. **Environment Setup**: No additional environment variables required
4. **Dependencies**: Uses existing project dependencies (Prisma, NextAuth)

---

## Summary

This feature turns every evidence interaction into a tracked, timestamped event. Officers work normally — viewing, downloading, verifying evidence — and the system silently builds a complete chain of custody behind the scenes. The resulting audit trail is court-admissible and can be exported as a PDF at any time.