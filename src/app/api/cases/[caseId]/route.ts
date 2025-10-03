import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { caseId } = await params
    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        officerId: session.user.id,
      },
      include: {
        evidence: {
          orderBy: {
            createdAt: "desc",
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!case_) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(case_)
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { caseId } = await params
    const { title, description, category, location, priority, status } = await req.json()

    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        officerId: session.user.id,
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        status: true,
      }
    })

    if (!case_) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    const updateData: any = {
      title,
      description,
      updatedAt: new Date(),
    }

    if (category) {
      updateData.category = category
    }
    if (location) {
      updateData.location = location
    }
    if (priority) {
      updateData.priority = priority
    }
    if (status) {
      updateData.status = status
    }

    const updatedCase = await prisma.case.update({
      where: {
        id: caseId,
      },
      data: updateData,
      include: {
        evidence: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    // Log activity based on what changed
    const statusChanged = status && case_.status !== status
    
    if (statusChanged) {
      // Check if case is being closed
      if (status === 'CLOSED') {
        await prisma.activity.create({
          data: {
            id: randomUUID(),
            type: 'CASE_CLOSED',
            title: 'Case Closed',
            description: `Closed case ${case_.caseNumber}: ${title || case_.title}`,
            userId: session.user.id,
            caseId,
          },
        })
      } else {
        // Log status change activity
        await prisma.activity.create({
          data: {
            id: randomUUID(),
            type: 'CASE_STATUS_CHANGED',
            title: 'Case Status Changed',
            description: `Changed status of case ${case_.caseNumber} from ${case_.status} to ${status}`,
            userId: session.user.id,
            caseId,
          },
        })
      }
    } else {
      // Log general update activity
      await prisma.activity.create({
        data: {
          id: randomUUID(),
          type: 'CASE_UPDATED',
          title: 'Case Updated',
          description: `Updated case ${case_.caseNumber}: ${title || case_.title}`,
          userId: session.user.id,
          caseId,
        },
      })
    }

    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { caseId } = await params
    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        officerId: session.user.id,
      },
    })

    if (!case_) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    await prisma.case.delete({
      where: {
        id: caseId,
      },
    })

    return NextResponse.json({ message: "Case deleted successfully" })
  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}