import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = parseInt(searchParams.get('skip') || '0')

    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id
      },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            badge: true
          }
        }
      }
    })

    return NextResponse.json({ activities, count: activities.length })

  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, metadata, caseId, evidenceId } = body

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        id: crypto.randomUUID(),
        type,
        title,
        description,
        metadata,
        userId: session.user.id,
        caseId,
        evidenceId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            badge: true
          }
        }
      }
    })

    return NextResponse.json({ activity }, { status: 201 })

  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}