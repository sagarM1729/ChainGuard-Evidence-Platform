import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evidenceManager } from "@/services/evidenceManager"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId')

    let whereClause: any = {}
    
    if (caseId) {
      // Get evidence for specific case
      whereClause.caseId = caseId
      
      // Verify user has access to this case
      const case_ = await prisma.case.findFirst({
        where: {
          id: caseId,
          officerId: session.user.id
        }
      })
      
      if (!case_) {
        return NextResponse.json(
          { error: "Case not found or access denied" },
          { status: 404 }
        )
      }
    } else {
      // Get all evidence for user's cases
      const userCases = await prisma.case.findMany({
        where: { officerId: session.user.id },
        select: { id: true }
      })
      
      whereClause.caseId = {
        in: userCases.map((c: { id: string }) => c.id)
      }
    }

    const evidence = await prisma.evidence.findMany({
      where: whereClause,
      include: {
        case: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      evidence: evidence.map((item: any) => ({
        ...item,
        custodyChain: item.custodyChain ? JSON.parse(item.custodyChain as string) : []
      }))
    })
    
  } catch (error) {
    console.error("Error fetching evidence:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('caseId') as string
    const notes = formData.get('notes') as string

    if (!file || !caseId) {
      return NextResponse.json(
        { error: "File and case ID are required" },
        { status: 400 }
      )
    }

    // Verify user has access to this case
    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        officerId: session.user.id
      }
    })
    
    if (!case_) {
      return NextResponse.json(
        { error: "Case not found or access denied" },
        { status: 404 }
      )
    }

    console.log('🔄 Processing evidence upload:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      caseId
    })

    // Store evidence using our Evidence Manager
    const result = await evidenceManager.storeEvidence(file, {
      caseId,
      filename: file.name,
      filetype: file.type,
      filesize: file.size,
      notes: notes || undefined,
      custodyOfficer: session.user.email
    })

    console.log('✅ Evidence stored successfully:', result)

    return NextResponse.json({
      message: "Evidence uploaded successfully",
      evidence: {
        ipfsCid: result.ipfsCid,
        retrievalUrl: result.retrievalUrl,
        fileHash: result.fileHash,
        blockchainTxId: result.blockchainTxId
      }
    })

  } catch (error) {
    console.error("Evidence upload error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to upload evidence" 
      },
      { status: 500 }
    )
  }
}
