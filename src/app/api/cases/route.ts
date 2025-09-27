import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const cases = await prisma.case.findMany({
      where: {
        officerId: session.user.id,
      },
      include: {
        _count: {
          select: {
            evidence: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({
      cases,
    })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, description, category, location, priority = "MEDIUM", status = "OPEN" } = await req.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    // Generate unique case number
    const caseCount = await prisma.case.count()
    const caseNumber = `CASE-${Date.now()}-${String(caseCount + 1).padStart(4, '0')}`
    
    const now = new Date()

    const caseData: any = {
      id: uuidv4(),
      caseNumber,
      title,
      description,
      location,
      priority,
      status,
      officerId: session.user.id,
      updatedAt: now,
    }

    if (category) {
      caseData.category = category
    }

    const newCase = await prisma.case.create({
      data: caseData,
      include: {
        _count: {
          select: {
            evidence: true,
          },
        },
      },
    })

    return NextResponse.json({
      case: newCase,
      message: "Case created successfully",
    })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
