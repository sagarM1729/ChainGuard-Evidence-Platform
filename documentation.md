# ChainGuard Evidence Platform - Complete Technical Documentation

## 📋 Project Overview

ChainGuard Evidence Platform is a next-generation digital evidence management system designed for law enforcement agencies. It combines traditional database efficiency with blockchain-inspired integrity verification and decentralized storage to create an unbreachable chain of custody system.

### Key Innovation: Three-Tier Architecture
The platform uses a unique three-tier approach that separates concerns while maintaining data integrity:

1. **Metadata Index (PostgreSQL)** - Fast querying and case management
2. **Integrity Notary (Merkle Tree Ledger)** - Tamper-proof verification
3. **Evidence Vault (IPFS/Pinata)** - Distributed, immutable file storage

## 🏗️ Technical Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChainGuard Evidence Platform                 │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15 + React 19 + TypeScript + Tailwind)      │
├─────────────────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes + NextAuth.js)                  │
├─────────────────────────────────────────────────────────────────┤
│                    Three-Tier Storage                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Tier 1    │  │   Tier 2    │  │   Tier 3    │            │
│  │  Metadata   │  │  Integrity  │  │  Evidence   │            │
│  │   Index     │  │   Notary    │  │    Vault    │            │
│  │             │  │             │  │             │            │
│  │ PostgreSQL  │  │   Merkle    │  │    IPFS     │            │
│  │  + Prisma   │  │    Tree     │  │  + Pinata   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend Framework** | Next.js | 15.5.0 | React-based full-stack framework |
| **UI Library** | React | 19.0.0 | Component-based user interface |
| **Language** | TypeScript | Latest | Type-safe development |
| **Styling** | Tailwind CSS | Latest | Utility-first CSS framework |
| **Database** | PostgreSQL | Latest | Primary data storage |
| **ORM** | Prisma | Latest | Database access and migrations |
| **Authentication** | NextAuth.js | Latest | Secure user authentication |
| **Email Service** | Resend API | Latest | Password reset and notifications |
| **File Storage** | Pinata/IPFS | Latest | Decentralized file storage |
| **AI Analysis** | Google Gemini | 2.0-flash-lite | Case analysis and pattern detection |
| **Testing** | Jest + Cypress | Latest | Unit and E2E testing |

## 🔐 Core Components Deep Dive

### 1. Merkle Tree Implementation

The Merkle tree is the heart of our integrity verification system. It provides cryptographic proof that evidence hasn't been tampered with.

#### Code Location: `src/lib/merkle.ts`

```typescript
// Core Merkle Tree Structure
interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

// Main Functions:
- createMerkleTree(data: string[]): MerkleNode
- getMerkleProof(tree: MerkleNode, targetHash: string): string[]
- verifyMerkleProof(proof: string[], targetHash: string, rootHash: string): boolean
- generateMerkleRoot(evidenceHashes: string[]): string
```

#### How It Works:
1. **Evidence Hashing**: Each piece of evidence is hashed using SHA-256
2. **Tree Construction**: Hashes are paired and combined to form parent nodes
3. **Root Generation**: The process continues until a single root hash is created
4. **Proof Generation**: For any evidence, we can generate a proof path to the root
5. **Verification**: Anyone can verify evidence integrity using the proof and root hash

#### Implementation Details:
```typescript
// From src/lib/merkle.ts
export function createMerkleTree(data: string[]): MerkleNode {
  if (data.length === 0) {
    throw new Error('Cannot create Merkle tree from empty data')
  }

  // Create leaf nodes from data
  let nodes: MerkleNode[] = data.map(item => ({
    hash: createHash('sha256').update(item).digest('hex'),
    data: item
  }))

  // Build tree level by level
  while (nodes.length > 1) {
    const nextLevel: MerkleNode[] = []
    
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i]
      const right = i + 1 < nodes.length ? nodes[i + 1] : left // Duplicate if odd
      
      const combinedHash = createHash('sha256')
        .update(left.hash + right.hash)
        .digest('hex')
      
      nextLevel.push({
        hash: combinedHash,
        left,
        right
      })
    }
    
    nodes = nextLevel
  }

  return nodes[0] // Root node
}
```

#### Database Integration:
The Merkle root is stored in the `cases` table for each case:

```sql
-- From prisma/schema.prisma
model Case {
  id           String @id @default(cuid())
  merkleRoot   String? // Stores the Merkle root hash
  // ... other fields
}
```

#### Usage in API:
```typescript
// From src/app/api/cases/[caseId]/route.ts
// When evidence is added, update Merkle root
const evidenceHashes = updatedCase.evidence.map(ev => ev.fileHash)
const merkleRoot = generateMerkleRoot(evidenceHashes)

await prisma.case.update({
  where: { id: caseId },
  data: { merkleRoot }
})
```

### 2. IPFS/Pinata Integration

Our distributed storage solution ensures evidence files are stored immutably across a decentralized network.

#### Code Location: `src/lib/pinata-client.ts`

```typescript
// Core Configuration
interface PinataConfig {
  jwt?: string;
  apiKey?: string;
  apiSecret?: string;
  gatewayUrl?: string;
}

// Main Functions:
- uploadFile(file: File): Promise<{ cid: string; success: boolean }>
- testConnection(): Promise<boolean>
- getFileUrl(cid: string): string
```

#### How IPFS Works in ChainGuard:
1. **File Upload**: Evidence files are uploaded to IPFS via Pinata
2. **Content Addressing**: Files are identified by their content hash (CID)
3. **Distributed Storage**: Files are replicated across multiple IPFS nodes
4. **Immutability**: Once uploaded, files cannot be modified (new versions get new CIDs)
5. **Resilience**: Multiple storage providers ensure availability

#### Implementation Details:
```typescript
// From src/lib/pinata-client.ts
export async function uploadFile(file: File): Promise<{ cid: string; success: boolean }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const pinataMetadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        size: file.size.toString()
      }
    })
    formData.append('pinataMetadata', pinataMetadata)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      cid: result.IpfsHash,
      success: true
    }
  } catch (error) {
    console.error('IPFS upload error:', error)
    return { cid: '', success: false }
  }
}
```

#### Database Schema Integration:
```sql
-- Evidence table stores IPFS CID
model Evidence {
  id         String @id @default(cuid())
  filename   String
  ipfsCid    String? // IPFS Content Identifier
  fileHash   String  // SHA-256 hash for Merkle tree
  // ... other fields
}
```

#### Resilience Strategy:
The platform includes fallback mechanisms when IPFS/Pinata is unavailable:

```typescript
// From src/lib/pinata-client.ts
// Fallback CID generation for testing/offline scenarios
function generateFallbackCid(filename: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  return `Qm${createHash('sha256').update(`${filename}-${timestamp}-${randomId}`).digest('hex').substring(0, 44)}`
}
```

### 3. Database Layer (PostgreSQL + Prisma)

The database serves as the metadata index, storing case information, user data, and evidence metadata while maintaining referential integrity.

#### Code Location: `prisma/schema.prisma`

#### Core Models:

```prisma
// User Management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  resetToken    String?
  resetTokenExpiry DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  cases         Case[]
  activities    Activity[]
}

// Case Management
model Case {
  id           String     @id @default(cuid())
  caseNumber   String     @unique
  title        String
  description  String
  category     String?
  location     String?
  status       String     @default("OPEN")
  priority     String     @default("MEDIUM")
  merkleRoot   String?    // Merkle tree root hash
  officerId    String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  User         User       @relation(fields: [officerId], references: [id])
  evidence     Evidence[]
  activities   Activity[]
}

// Evidence Storage
model Evidence {
  id            String     @id @default(cuid())
  filename      String
  originalName  String?
  fileSize      Int?
  fileType      String?
  fileHash      String     // SHA-256 for Merkle tree
  ipfsCid       String?    // IPFS Content Identifier
  evidenceType  String?
  category      String?
  collectedAt   DateTime?
  collectedBy   String?
  location      String?
  notes         String?
  tags          String[]
  caseId        String
  uploadedAt    DateTime   @default(now())
  
  Case          Case       @relation(fields: [caseId], references: [id], onDelete: Cascade)
  activities    Activity[]
}

// Activity Tracking
model Activity {
  id          String   @id @default(cuid())
  type        String   // "CASE_CREATED", "EVIDENCE_UPLOADED", etc.
  description String
  timestamp   DateTime @default(now())
  userId      String
  caseId      String?
  evidenceId  String?
  metadata    Json?    // Additional context data
  
  User        User      @relation(fields: [userId], references: [id])
  Case        Case?     @relation(fields: [caseId], references: [id])
  Evidence    Evidence? @relation(fields: [evidenceId], references: [id])
}
```

#### Database Operations:

**Case Creation with Merkle Root:**
```typescript
// From src/app/api/cases/route.ts
const newCase = await prisma.case.create({
  data: {
    caseNumber,
    title,
    description,
    category,
    location,
    status,
    priority,
    officerId: session.user.id,
    merkleRoot: null, // Will be updated when evidence is added
  }
})
```

**Evidence Upload with Hash Calculation:**
```typescript
// From src/app/api/evidence/route.ts
// Calculate file hash for Merkle tree
const fileBuffer = Buffer.from(await file.arrayBuffer())
const fileHash = createHash('sha256').update(fileBuffer).digest('hex')

// Upload to IPFS
const { cid: ipfsCid, success } = await uploadFile(file)

// Store in database
const evidence = await prisma.evidence.create({
  data: {
    filename: sanitizedFilename,
    originalName: file.name,
    fileSize: file.size,
    fileType: file.type,
    fileHash,
    ipfsCid: success ? ipfsCid : null,
    caseId,
    // ... other fields
  }
})

// Update case Merkle root
const allEvidence = await prisma.evidence.findMany({
  where: { caseId },
  select: { fileHash: true }
})

const evidenceHashes = allEvidence.map(ev => ev.fileHash)
const merkleRoot = generateMerkleRoot(evidenceHashes)

await prisma.case.update({
  where: { id: caseId },
  data: { merkleRoot }
})
```

### 4. Evidence Integrity Verification

The platform provides multiple layers of integrity verification to ensure evidence hasn't been tampered with.

#### Code Location: `src/components/evidence/TamperDetector.tsx`

#### Verification Process:
1. **File Hash Verification**: Re-calculate SHA-256 and compare with stored hash
2. **Merkle Proof Verification**: Verify evidence is part of the case's Merkle tree
3. **IPFS Integrity Check**: Verify file content matches IPFS CID
4. **Database Consistency**: Ensure metadata consistency across all systems

```typescript
// From src/components/evidence/TamperDetector.tsx
const verifyEvidence = async (evidenceId: string) => {
  try {
    const response = await fetch(`/api/evidence/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evidenceId })
    })

    const result = await response.json()
    
    if (result.verified) {
      setVerificationStatus({
        status: 'verified',
        message: 'Evidence integrity confirmed',
        details: result.details
      })
    } else {
      setVerificationStatus({
        status: 'tampered',
        message: 'Evidence integrity compromised',
        details: result.details
      })
    }
  } catch (error) {
    setVerificationStatus({
      status: 'error',
      message: 'Verification failed',
      details: error.message
    })
  }
}
```

#### Verification API:
```typescript
// From src/app/api/evidence/verify/route.ts
export async function POST(req: NextRequest) {
  const { evidenceId } = await req.json()

  // Get evidence from database
  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { Case: true }
  })

  // Get all evidence for the case to rebuild Merkle tree
  const caseEvidence = await prisma.evidence.findMany({
    where: { caseId: evidence.caseId },
    select: { fileHash: true }
  })

  // Rebuild Merkle tree and verify
  const evidenceHashes = caseEvidence.map(ev => ev.fileHash)
  const merkleRoot = generateMerkleRoot(evidenceHashes)
  
  const verified = merkleRoot === evidence.Case.merkleRoot

  return NextResponse.json({
    verified,
    details: {
      storedMerkleRoot: evidence.Case.merkleRoot,
      calculatedMerkleRoot: merkleRoot,
      evidenceHash: evidence.fileHash,
      ipfsCid: evidence.ipfsCid
    }
  })
}
```

## 🤖 AI Intelligence Engine

The platform includes an AI-powered analysis system using Google's Gemini model for case analysis and pattern detection.

#### Code Location: `src/app/api/cases/[caseId]/analyze/route.ts`

#### Features:
- **Case Summary Generation**: AI-generated summaries of case details
- **Entity Extraction**: Identify people, locations, organizations, and objects
- **Suspect Profiling**: Analysis of potential suspects based on evidence patterns
- **Pattern Detection**: Cross-reference with similar cases
- **Next Steps Recommendations**: Prioritized investigation actions

```typescript
// AI Analysis Implementation
async function analyzeCaseWithGemini(caseData: any, allCases: any[]): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

  const prompt = `As an expert criminal investigation analyst, analyze the following case...`
  
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  // Parse JSON response
  let jsonText = text
  if (text.includes('```json')) {
    jsonText = text.split('```json')[1].split('```')[0].trim()
  }
  
  return JSON.parse(jsonText)
}
```

#### Frontend Integration:
```typescript
// From src/components/cases/AIIntelligenceEngine.tsx
const handleRunAnalysis = async () => {
  setIsAnalyzing(true)
  
  const response = await fetch(`/api/cases/${caseId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  
  const data = await response.json()
  setAnalysis(data.analysis)
  setIsAnalyzing(false)
}
```

## 🔒 Security Implementation

### Authentication & Authorization

#### Code Location: `src/lib/auth.ts`

```typescript
// NextAuth.js Configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('User not found')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login'
  }
}
```

### Password Security

- **Hashing**: bcryptjs with 12 salt rounds
- **Reset Tokens**: Time-limited OTP tokens with 15-minute expiry
- **Session Management**: Secure JWT tokens with automatic cleanup

### Data Protection

- **SQL Injection Prevention**: Parameterized queries via Prisma ORM
- **Input Validation**: Server-side validation on all endpoints
- **File Upload Security**: Type validation and size limits
- **CORS Protection**: Configured for specific origins only

## 🔄 Data Flow Architecture

### Evidence Upload Flow

```
1. User uploads file via ComprehensiveUploadForm.tsx
   ↓
2. File sent to /api/evidence POST endpoint
   ↓
3. File hash calculated (SHA-256)
   ↓
4. File uploaded to IPFS via Pinata
   ↓
5. Evidence metadata stored in PostgreSQL
   ↓
6. Case Merkle root updated with new evidence hash
   ↓
7. Activity logged in database
   ↓
8. User receives confirmation with integrity details
```

### Case Analysis Flow

```
1. User clicks "Run Full Analysis" in AIIntelligenceEngine.tsx
   ↓
2. Request sent to /api/cases/[caseId]/analyze
   ↓
3. Case data and evidence retrieved from database
   ↓
4. Related cases fetched for pattern detection
   ↓
5. Data sent to Gemini AI for analysis
   ↓
6. AI response parsed and structured
   ↓
7. Analysis results returned to frontend
   ↓
8. Results displayed in organized UI sections
```

### Integrity Verification Flow

```
1. User requests evidence verification
   ↓
2. TamperDetector component calls /api/evidence/verify
   ↓
3. Evidence metadata retrieved from database
   ↓
4. All case evidence hashes collected
   ↓
5. Merkle tree rebuilt from current evidence
   ↓
6. New Merkle root compared with stored root
   ↓
7. Verification result returned with details
   ↓
8. UI displays verification status and details
```

## 📁 Project Structure & Code Organization

```
ChainGuard-Evidence-Platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API endpoints
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── cases/                # Case management APIs
│   │   │   │   └── [caseId]/
│   │   │   │       ├── analyze/      # AI analysis endpoint
│   │   │   │       └── route.ts      # Case CRUD operations
│   │   │   ├── evidence/             # Evidence management APIs
│   │   │   │   ├── verify/           # Integrity verification
│   │   │   │   └── route.ts          # Evidence upload/retrieval
│   │   │   ├── activities/           # Activity tracking API
│   │   │   └── users/                # User management APIs
│   │   ├── dashboard/                # Protected dashboard pages
│   │   │   ├── cases/                # Case management UI
│   │   │   │   ├── [caseId]/         # Individual case pages
│   │   │   │   ├── new/              # Case creation
│   │   │   │   └── page.tsx          # Cases list
│   │   │   ├── layout.tsx            # Dashboard layout
│   │   │   └── page.tsx              # Dashboard home
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   ├── components/                   # React components
│   │   ├── cases/                    # Case-related components
│   │   │   └── AIIntelligenceEngine.tsx
│   │   ├── evidence/                 # Evidence components
│   │   │   ├── ComprehensiveUploadForm.tsx
│   │   │   └── TamperDetector.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── providers/                # Context providers
│   │   └── ui/                       # Reusable UI components
│   ├── lib/                          # Core utilities
│   │   ├── auth.ts                   # Authentication config
│   │   ├── merkle.ts                 # Merkle tree implementation
│   │   ├── pinata-client.ts          # IPFS/Pinata integration
│   │   ├── prisma.ts                 # Database client
│   │   └── utils.ts                  # General utilities
│   ├── services/                     # Business logic services
│   │   └── evidenceManager.ts        # Evidence management logic
│   └── types/                        # TypeScript type definitions
├── prisma/                           # Database configuration
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Database migrations
│   └── seed-whitelist.ts             # Database seeding
├── public/                           # Static assets
│   ├── icons/                        # App icons and PWA assets
│   └── blockchain.png                # Logo and images
├── database-backups/                 # Database backup files
├── docs/                             # Additional documentation
├── scripts/                          # Utility scripts
├── test/                             # Test files
└── Configuration files:
    ├── package.json                  # Dependencies and scripts
    ├── next.config.mjs               # Next.js configuration
    ├── tailwind.config.ts            # Tailwind CSS config
    ├── tsconfig.json                 # TypeScript configuration
    ├── jest.config.ts                # Jest testing config
    ├── cypress.config.ts             # Cypress E2E config
    └── .env.local                    # Environment variables
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chainguard"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# IPFS Storage
PINATA_JWT="your-pinata-jwt-token"
# OR
PINATA_API_KEY="your-pinata-api-key"
PINATA_API_SECRET="your-pinata-api-secret"

# Optional
PINATA_GATEWAY_URL="https://gateway.pinata.cloud"

# AI Analysis
GEMINI_API_KEY="your-google-gemini-api-key"
```

## 🚀 Deployment Guide

### Production Deployment Steps

1. **Environment Setup**
```bash
# Clone repository
git clone https://github.com/sagarM1729/ChainGuard-Evidence-Platform.git
cd ChainGuard-Evidence-Platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your production values
```

2. **Database Setup**
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npm run seed
```

3. **Build and Deploy**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Recommended Production Architecture

```
Internet → Load Balancer → Next.js App (Multiple instances)
                              ↓
                         PostgreSQL Database
                              ↓
                       IPFS/Pinata Network
```

## 🧪 Testing Strategy

### Unit Tests
- **Location**: `src/lib/merkle.test.ts`
- **Coverage**: Merkle tree operations, utility functions
- **Command**: `npm run test`

### Integration Tests
- **Location**: `test/integration-test.ts`
- **Coverage**: API endpoints, database operations
- **Command**: `npm run test:integration`

### End-to-End Tests
- **Location**: `cypress/` directory
- **Coverage**: Complete user workflows
- **Command**: `npm run test:e2e`

## 📊 Performance Considerations

### Database Optimization
- Indexed fields: `email`, `caseNumber`, `fileHash`
- Connection pooling via Prisma
- Optimized queries with selective field loading

### File Storage Optimization
- Chunked uploads for large files
- IPFS content deduplication
- Pinata CDN for fast retrieval

### Frontend Performance
- Code splitting with Next.js
- Image optimization
- Lazy loading of components

## 🔮 Future Enhancements

### Planned Features
1. **Multi-signature Evidence Validation**: Require multiple officers to validate critical evidence
2. **Blockchain Integration**: Optional full blockchain backend for maximum security
3. **Advanced AI Features**: Predictive case outcomes, automated evidence categorization
4. **Mobile App**: React Native mobile application for field operations
5. **Real-time Collaboration**: WebSocket-based real-time case collaboration

### Technical Improvements
1. **Microservices Architecture**: Split into specialized services
2. **Advanced Caching**: Redis integration for improved performance
3. **Audit Logging**: Comprehensive audit trail with tamper-proof logs
4. **Backup Automation**: Automated database and IPFS backups
5. **Monitoring**: Application performance monitoring and alerting

## 🛠️ Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Run database studio
npx prisma studio

# Check types
npm run type-check

# Lint code
npm run lint
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for pre-commit hooks

### Database Management
```bash
# Create migration
npx prisma migrate dev --name your-migration-name

# Reset database
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## 🤝 Contributing Guidelines

### Development Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests
- Document complex logic
- Use semantic commit messages
- Maintain backwards compatibility

## 📚 Additional Resources

### Documentation Files
- `ACTIVITY_IMPLEMENTATION.md` - Activity tracking system details
- `AI_ANALYSIS_SIMPLIFIED.md` - AI analysis implementation
- `PINATA_STORAGE_PLAYBOOK.md` - IPFS storage management
- `docs/architecture.md` - Detailed architecture documentation
- `docs/api-documentation.md` - API endpoint documentation

### External References
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Merkle Trees Explained](https://en.wikipedia.org/wiki/Merkle_tree)

## 🔍 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database status
npx prisma db pull

# Reset database
npx prisma migrate reset

# Generate fresh client
npx prisma generate
```

**IPFS Upload Failures**
- Verify Pinata API credentials
- Check network connectivity
- Review file size limits
- Test with smaller files first

**AI Analysis Errors**
- Verify Gemini API key is valid
- Check API quota limits
- Review console logs for detailed errors
- Test with simpler prompts

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database debugging
DATABASE_DEBUG=true npm run dev
```

## 📞 Support

For technical support or questions about the ChainGuard Evidence Platform:

- **GitHub Issues**: [Create an issue](https://github.com/sagarM1729/ChainGuard-Evidence-Platform/issues)
- **Documentation**: Refer to the `docs/` directory
- **Community**: Join our discussions in GitHub Discussions

---

**ChainGuard Evidence Platform** - Securing justice through immutable evidence management.

*Last updated: November 27, 2025*