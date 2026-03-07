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

    // Gather system health metrics in parallel
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalCases,
      totalEvidence,
      totalActivities,
      recentActivities,
      recentLogins,
      activitiesLast7d,
      casesByStatus,
      evidenceByType,
      usersByRole,
      dbHealthCheck,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.evidence.count(),
      prisma.activity.count(),
      prisma.activity.count({ where: { createdAt: { gte: last24h } } }),
      prisma.activity.count({ where: { type: 'USER_LOGIN', createdAt: { gte: last24h } } }),
      // Activities per day for last 7 days
      prisma.activity.groupBy({
        by: ['type'],
        where: { createdAt: { gte: last7d } },
        _count: { id: true },
      }),
      prisma.case.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.evidence.groupBy({
        by: ['evidenceType'],
        _count: { id: true },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      // Simple health check: can we query?
      prisma.$queryRaw`SELECT 1 as ok`.then(() => true).catch(() => false),
    ])

    // Calculate storage stats from evidence
    const storageResult = await prisma.evidence.aggregate({
      _sum: { filesize: true },
      _count: { id: true },
    })

    // Get recent activities for the activity trend
    const activityDays: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const count = await prisma.activity.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      })
      activityDays.push({
        date: dayStart.toISOString().split('T')[0],
        count,
      })
    }

    return NextResponse.json({
      database: {
        healthy: dbHealthCheck,
        totalRecords: totalUsers + totalCases + totalEvidence + totalActivities,
      },
      overview: {
        totalUsers,
        totalCases,
        totalEvidence,
        totalActivities,
        activitiesLast24h: recentActivities,
        loginsLast24h: recentLogins,
      },
      storage: {
        totalFiles: storageResult._count.id,
        totalSizeBytes: storageResult._sum.filesize || 0,
      },
      distributions: {
        casesByStatus: casesByStatus.map(c => ({ status: c.status, count: c._count.id })),
        evidenceByType: evidenceByType.map(e => ({ type: e.evidenceType, count: e._count.id })),
        usersByRole: usersByRole.map(u => ({ role: u.role, count: u._count.id })),
        activityByType: activitiesLast7d.map(a => ({ type: a.type, count: a._count.id })),
      },
      activityTrend: activityDays,
      serverTime: now.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching system health:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
