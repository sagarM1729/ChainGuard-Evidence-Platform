import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evidenceManager } from "@/services/evidenceManager"

export async function GET(req: NextRequest, { params }: { params: Promise<{ evidenceId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { evidenceId } = await params

    // Get evidence details from database
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
            title: true,
            description: true
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

    // Parse custody chain
    let custodyChain = []
    if (evidence.custodyChain) {
      custodyChain = JSON.parse(evidence.custodyChain as string)
    }

    return NextResponse.json({
      evidence: {
        ...evidence,
        custodyChain
      }
    })

  } catch (error) {
    console.error("Error fetching evidence details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ evidenceId: string }> }) {
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
      }
    })

    if (!evidence) {
      return NextResponse.json(
        { error: "Evidence not found or access denied" },
        { status: 404 }
      )
    }

    // Note: We don't actually delete from IPFS (immutable)
    // Just mark as deleted in database
    await prisma.evidence.delete({
      where: { id: evidenceId }
    })

    return NextResponse.json({
      message: "Evidence record deleted successfully",
      note: "File remains on IPFS for immutability compliance"
    })

  } catch (error) {
    console.error("Error deleting evidence:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
