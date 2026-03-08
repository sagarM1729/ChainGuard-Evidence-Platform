import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'ACCESS_ADMIN_PANEL')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build filter
    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (userId) where.userId = userId
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {}
      if (dateFrom) createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        createdAt.lte = end
      }
      where.createdAt = createdAt
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            department: true,
            badge: true,
          }
        }
      }
    })

    // Build CSV
    const headers = ['Timestamp', 'Type', 'Title', 'Description', 'User Name', 'User Email', 'Role', 'Department', 'Badge', 'Case ID', 'Evidence ID']
    const rows = activities.map(a => [
      new Date(a.createdAt).toISOString(),
      a.type,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${(a.description || '').replace(/"/g, '""')}"`,
      `"${(a.user.name || '').replace(/"/g, '""')}"`,
      a.user.email,
      a.user.role,
      a.user.department || '',
      a.user.badge || '',
      a.caseId || '',
      a.evidenceId || '',
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
