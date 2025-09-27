import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evidenceManager } from "@/services/evidenceManager"

export async function POST(req: NextRequest, { params }: { params: Promise<{ evidenceId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { evidenceId } = await params

    // Verify user has access to this evidence
    const evidence = await prisma.evidence.findFirst({
      where: {
        id: evidenceId,
        case: {
          officerId: session.user.id
        }
      },
      include: {
        case: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!evidence) {
      return NextResponse.json(
        { error: "Evidence not found or access denied" },
        { status: 404 }
      )
    }

  console.log('� Starting evidence integrity verification for:', evidenceId)

    // Verify evidence integrity using Evidence Manager
    const isValid = await evidenceManager.verifyEvidenceIntegrity(evidenceId)

    // Also get Merkle ledger details if available
  const merkleVerification = await evidenceManager.getMerkleVerification(evidenceId)

    const verificationResult = {
      evidenceId: evidenceId,
      filename: evidence.filename,
      ipfsCid: evidence.ipfsCid,
      fileHash: evidence.fileHash,
      isValid: isValid,
      verifiedAt: new Date().toISOString(),
      merkleRoot: merkleVerification?.merkleRoot ?? null,
      merkleVerification
    }

    console.log('✅ Evidence verification completed:', verificationResult)

    return NextResponse.json({
      message: isValid ? "Evidence integrity verified" : "Evidence integrity check failed",
      verification: verificationResult
    })

  } catch (error) {
    console.error("Evidence verification error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to verify evidence" 
      },
      { status: 500 }
    )
  }
}
