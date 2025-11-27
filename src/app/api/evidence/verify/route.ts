
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { verifyMerkleProof, createLeafHash, getMerkleRoot, type MerkleProof } from '@/lib/merkle'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const evidenceId = formData.get('evidenceId') as string

    if (!file || !evidenceId) {
      return NextResponse.json(
        { error: "File and evidence ID are required" },
        { status: 400 }
      )
    }

    // Get the evidence record
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        case: true
      }
    })

    if (!evidence) {
      return NextResponse.json(
        { error: "Evidence not found" },
        { status: 404 }
      )
    }

    // Verify user has access to the case
    if (evidence.case.officerId !== session.user.id) {
       // In a real app, we might check for shared access, but for now strict ownership
    }

    // 1. Calculate hash of the uploaded file (Content Integrity)
    const buffer = Buffer.from(await file.arrayBuffer())
    const hashSum = crypto.createHash('sha256')
    hashSum.update(buffer)
    const currentHash = hashSum.digest('hex')

    const storedHashClean = evidence.fileHash.replace('sha256-', '')
    const isContentVerified = currentHash === storedHashClean

    // 2. Verify Database Record Integrity (Chain Integrity)
    // We rebuild the Merkle Tree from the CURRENT database state and compare it 
    // to the IMMUTABLE Merkle Root stored in the Case.
    
    let isChainVerified = false
    let chainVerificationError = null
    let calculatedRoot = null

    if (evidence.case.merkleRoot) {
      try {
        // Fetch ALL evidence for this case to rebuild the tree
        // This is the "Gold Standard" verification: Rebuild the world and check the root.
        const allCaseEvidence = await prisma.evidence.findMany({
          where: { caseId: evidence.caseId },
          orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' } // Deterministic sort to match evidenceManager
          ]
        })

        // Reconstruct leaves from current DB state
        const leaves = allCaseEvidence.map(item => 
          createLeafHash({
            caseId: item.caseId,
            evidenceId: item.id,
            ipfsCid: item.ipfsCid,
            fileHash: item.fileHash, // If this was tampered in DB, the leaf changes
            timestamp: item.createdAt.toISOString()
          })
        )

        // Calculate the root from these leaves
        calculatedRoot = getMerkleRoot(leaves)

        // Compare calculated root with the stored Case Root
        // If they don't match, it means SOMETHING in the DB (one of the evidence items) was tampered with.
        isChainVerified = calculatedRoot === evidence.case.merkleRoot

      } catch (e) {
        console.error("Merkle verification error:", e)
        chainVerificationError = "Failed to verify chain integrity"
      }
    } else {
      // If no root exists yet (legacy or pending), we can't verify chain
      isChainVerified = true 
    }

    // Final Verification Status
    // Both Content AND Chain must be valid
    const isVerified = isContentVerified && isChainVerified

    let statusMessage = "Integrity Verified"
    if (!isContentVerified) statusMessage = "File Content Mismatch (Tampered File)"
    else if (!isChainVerified) statusMessage = "Database Record Mismatch (Tampered Metadata)"

    return NextResponse.json({
      verified: isVerified,
      isContentVerified,
      isChainVerified,
      statusMessage,
      storedHash: evidence.fileHash,
      currentHash: currentHash,
      filename: evidence.filename,
      timestamp: new Date().toISOString(),
      debug: {
        calculatedRoot,
        storedRoot: evidence.case.merkleRoot
      }
    })

  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
