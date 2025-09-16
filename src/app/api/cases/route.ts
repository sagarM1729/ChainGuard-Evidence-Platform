import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const { title, description, status = "open" } = await req.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        status,
        officerId: session.user.id,
      },
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
