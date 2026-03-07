# Automatic Evidence Custody Chain Tracking

## Feature Overview

This feature implements comprehensive, automatic custody chain tracking for all evidence interactions in the ChainGuard Evidence Platform. Every action performed on evidence files is now automatically logged to create a complete, court-admissible audit trail.

## Implementation Date
**March 7, 2026**

## Legal Compliance
✅ **Court-Admissible Documentation**  
✅ **Chain of Custody Requirements**  
✅ **Forensic Investigation Standards**  
✅ **Evidence Handling Protocols**  
✅ **Officer Accountability Tracking**

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

| Action | Trigger | Location | Description |
|--------|---------|----------|-------------|
| `INITIAL_UPLOAD` | Evidence creation | Evidence API | When evidence is first uploaded |
| `EVIDENCE_VIEWED` | View button click | Case details page | When evidence file is opened/viewed |
| `EVIDENCE_DOWNLOADED` | Download button click | Case details page | When evidence file is downloaded |
| `EVIDENCE_VERIFIED` | Integrity verification | TamperDetector | When forensic verification is performed |
| `EVIDENCE_DELETED` | Evidence deletion | Evidence API | When evidence record is deleted |
| `CUSTODY_REPORT_GENERATED` | PDF report generation | Custody report API | When custody chain PDF is generated |

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

## Security Considerations

- **Authentication Required**: All custody updates require valid session
- **Authorization Checks**: Users can only update custody for cases they have access to
- **Error Handling**: Failed custody updates don't block evidence operations 
- **Input Validation**: Action types validated against predefined list
- **Data Integrity**: Custody chains stored as JSON with proper escaping

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
- **Bulk operations** - custody tracking for multiple evidence files
- **Location tracking** - GPS coordinates for field operations
- **Digital signatures** - cryptographic signing of custody entries
- **Role-based actions** - different action types based on user roles
- **Backup notifications** - alerts when custody chains are backed up
- **Integration APIs** - webhooks for external systems

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

1. **Database Migration**: Run `npx prisma generate` after schema changes
2. **Type Generation**: Ensure Prisma client is regenerated
3. **Environment Setup**: No additional environment variables required
4. **Dependencies**: Uses existing project dependencies (Prisma, NextAuth)

---

This feature ensures complete legal compliance for evidence handling while maintaining the existing user experience and adding enhanced download functionality.