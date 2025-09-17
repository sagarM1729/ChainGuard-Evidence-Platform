import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    })

    if (!case_) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    const updatedCase = await prisma.case.update({
      where: {
        id: caseId,
      },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
      include: {
        evidence: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

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