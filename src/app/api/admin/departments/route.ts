import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!hasPermission(session.user.role, 'ACCESS_ADMIN_PANEL')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get all users grouped by department
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        badge: true,
        createdAt: true,
      },
      orderBy: { department: 'asc' }
    })

    // Get all cases with officer info
    const cases = await prisma.case.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        department: true,
        officerId: true,
        createdAt: true,
      }
    })

    // Get evidence counts per case
    const evidenceCounts = await prisma.evidence.groupBy({
      by: ['caseId'],
      _count: { id: true }
    })
    const evidenceMap = Object.fromEntries(
      evidenceCounts.map(e => [e.caseId, e._count.id])
    )

    // Build department stats
    const departmentMap = new Map<string, {
      name: string
      users: typeof users
      cases: typeof cases
      totalEvidence: number
      activeCases: number
      closedCases: number
      highPriorityCases: number
    }>()

    // Group users by department
    for (const user of users) {
      const dept = user.department || 'Unassigned'
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          name: dept,
          users: [],
          cases: [],
          totalEvidence: 0,
          activeCases: 0,
          closedCases: 0,
          highPriorityCases: 0,
        })
      }
      departmentMap.get(dept)!.users.push(user)
    }

    // Group cases by department
    for (const c of cases) {
      const dept = c.department || 'Unassigned'
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          name: dept,
          users: [],
          cases: [],
          totalEvidence: 0,
          activeCases: 0,
          closedCases: 0,
          highPriorityCases: 0,
        })
      }
      const entry = departmentMap.get(dept)!
      entry.cases.push(c)
      entry.totalEvidence += evidenceMap[c.id] || 0
      if (c.status === 'CLOSED') {
        entry.closedCases++
      } else {
        entry.activeCases++
      }
      if (c.priority === 'HIGH' || c.priority === 'CRITICAL') {
        entry.highPriorityCases++
      }
    }

    // Convert to array
    const departments = Array.from(departmentMap.values()).map(dept => ({
      name: dept.name,
      userCount: dept.users.length,
      caseCount: dept.cases.length,
      activeCases: dept.activeCases,
      closedCases: dept.closedCases,
      highPriorityCases: dept.highPriorityCases,
      totalEvidence: dept.totalEvidence,
      users: dept.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        badge: u.badge,
      })),
      cases: dept.cases.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority,
        evidenceCount: evidenceMap[c.id] || 0,
        createdAt: c.createdAt,
      })),
    }))

    // Sort by case count descending
    departments.sort((a, b) => b.caseCount - a.caseCount)

    return NextResponse.json({
      departments,
      summary: {
        totalDepartments: departments.length,
        totalUsers: users.length,
        totalCases: cases.length,
        totalEvidence: Object.values(evidenceMap).reduce((a, b) => a + b, 0),
      }
    })
    
  } catch (error) {
    console.error('Error fetching department stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
