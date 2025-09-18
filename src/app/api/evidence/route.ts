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
        Case: {
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

    const contentType = req.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      // Handle JSON evidence data (from our new form)
      const evidenceData = await req.json()
      
      const { 
        caseId, 
        filename, 
        filetype, 
        filesize, 
        notes, 
        evidenceType,
        category,
        tags,
        collectedAt,
        collectedBy,
        location,
        ipfsCid,
        retrievalUrl,
        fileHash
      } = evidenceData

      if (!caseId || !filename || !ipfsCid) {
        return NextResponse.json(
          { error: "Case ID, filename, and IPFS CID are required" },
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

      // Generate file hash if not provided
      const evidenceFileHash = fileHash || `sha256-${ipfsCid}`

      // Create evidence record in database
      const evidence = await prisma.evidence.create({
        data: {
          id: crypto.randomUUID(),
          filename,
          filetype,
          filesize,
          notes,
          evidenceType: evidenceType || 'DOCUMENT',
          category,
          tags,
          ipfsCid,
          ipfsHash: ipfsCid, // Legacy field
          fileHash: evidenceFileHash,
          retrievalUrl,
          collectedAt: collectedAt ? new Date(collectedAt) : undefined,
          collectedBy,
          location,
          caseId,
          updatedAt: new Date(),
          custodyChain: JSON.stringify([{
            officer: session.user.email,
            action: 'CREATED',
            timestamp: new Date().toISOString(),
            location: location || 'Digital Evidence System'
          }])
        }
      })

      return NextResponse.json({
        message: "Evidence created successfully",
        evidence
      })
    } else {
      // Handle FormData upload (comprehensive method)
      const formData = await req.formData()
      const file = formData.get('file') as File
      const caseId = formData.get('caseId') as string
      const notes = formData.get('notes') as string
      const evidenceType = formData.get('evidenceType') as string
      const category = formData.get('category') as string
      const tagsJson = formData.get('tags') as string
      const collectedAt = formData.get('collectedAt') as string
      const collectedTime = formData.get('collectedTime') as string
      const collectedBy = formData.get('collectedBy') as string
      const location = formData.get('location') as string
      
      // Parse tags from JSON
      let tags: string[] = []
      try {
        tags = tagsJson ? JSON.parse(tagsJson) : []
      } catch (e) {
        console.warn('Failed to parse tags:', e)
      }

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

      // Store evidence using our Evidence Manager (basic fields only)
      const result = await evidenceManager.storeEvidence(file, {
        caseId,
        filename: file.name,
        filetype: file.type,
        filesize: file.size,
        notes: notes || undefined,
        custodyOfficer: session.user.email
      })

      // Map frontend evidence type to Prisma enum
      const mapEvidenceType = (type: string) => {
        const typeMap: { [key: string]: string } = {
          'DOCUMENT': 'DOCUMENT',
          'PHOTO': 'PHOTO', 
          'VIDEO': 'VIDEO',
          'AUDIO': 'AUDIO',
          'PHYSICAL': 'OTHER',
          'DIGITAL': 'DIGITAL_FILE'
        }
        return typeMap[type] || 'DOCUMENT'
      }

      // Find and update the evidence record with comprehensive fields
      const evidenceRecord = await prisma.evidence.findFirst({
        where: { ipfsCid: result.ipfsCid }
      })

      if (evidenceRecord) {
        await prisma.evidence.update({
          where: { id: evidenceRecord.id },
          data: {
            evidenceType: mapEvidenceType(evidenceType || 'DOCUMENT') as any,
            category: category || '',
            tags: tags || [],
            collectedAt: collectedAt ? new Date(`${collectedAt}T${collectedTime || '00:00'}`) : new Date(),
            collectedBy: collectedBy || '',
            location: location || '',
            custodyChain: JSON.stringify([{
              officer: session.user.email,
              action: 'UPLOADED',
              timestamp: new Date().toISOString(),
              location: location || 'Digital Evidence System'
            }])
          }
        })
      }

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
    }

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
