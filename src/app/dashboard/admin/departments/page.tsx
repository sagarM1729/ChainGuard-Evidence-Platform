'use client'

import { useSession } from 'next-auth/react'
import { hasPermission, getRoleDisplayName } from '@/lib/rbac'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Shield,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
} from 'lucide-react'

interface DepartmentUser {
  id: string
  name: string
  email: string
  role: string
  badge: string
}

interface DepartmentCase {
  id: string
  title: string
  status: string
  priority: string
  evidenceCount: number
  createdAt: string
}

interface Department {
  name: string
  userCount: number
  caseCount: number
  activeCases: number
  closedCases: number
  highPriorityCases: number
  totalEvidence: number
  users: DepartmentUser[]
  cases: DepartmentCase[]
}

interface DepartmentData {
  departments: Department[]
  summary: {
    totalDepartments: number
    totalUsers: number
    totalCases: number
    totalEvidence: number
  }
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  COLD_CASE: 'bg-purple-100 text-purple-800',
  ARCHIVED: 'bg-slate-100 text-slate-800',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export default function DepartmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DepartmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedDept, setExpandedDept] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, 'users' | 'cases'>>({})

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (!hasPermission(session.user.role, 'ACCESS_ADMIN_PANEL')) {
      router.push('/dashboard')
      return
    }

    fetchDepartments()
  }, [session, status, router])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (deptName: string) => {
    setExpandedDept(prev => prev === deptName ? null : deptName)
  }

  const getTab = (deptName: string) => activeTab[deptName] || 'users'

  const setTab = (deptName: string, tab: 'users' | 'cases') => {
    setActiveTab(prev => ({ ...prev, [deptName]: tab }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !hasPermission(session.user.role, 'ACCESS_ADMIN_PANEL')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Admin role required to access this page.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin', icon: <Shield className="h-4 w-4" /> },
          { label: 'Departments' },
        ]}
        className="mb-4"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Department Overview</h1>
        <p className="text-gray-600">
          Monitor department workloads, case assignments, and personnel distribution
        </p>
      </div>

      {/* Summary Stats */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalDepartments}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Personnel</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalCases}</p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evidence Items</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalEvidence}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Department Cards */}
      <div className="space-y-4">
        {data?.departments.map((dept) => (
          <Card key={dept.name} className="overflow-hidden">
            {/* Department Header - Clickable */}
            <button
              onClick={() => toggleExpand(dept.name)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-500">
                    {dept.userCount} personnel &middot; {dept.caseCount} cases &middot; {dept.totalEvidence} evidence items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-center px-3">
                    <div className="text-lg font-bold text-green-600">{dept.activeCases}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-lg font-bold text-gray-400">{dept.closedCases}</div>
                    <div className="text-xs text-gray-500">Closed</div>
                  </div>
                  {dept.highPriorityCases > 0 && (
                    <div className="text-center px-3">
                      <div className="text-lg font-bold text-red-600">{dept.highPriorityCases}</div>
                      <div className="text-xs text-gray-500">High Priority</div>
                    </div>
                  )}
                </div>
                {expandedDept === dept.name ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Expandable Content */}
            {expandedDept === dept.name && (
              <div className="border-t border-gray-200">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                  <button
                    onClick={() => setTab(dept.name, 'users')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      getTab(dept.name) === 'users'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Personnel ({dept.userCount})
                  </button>
                  <button
                    onClick={() => setTab(dept.name, 'cases')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      getTab(dept.name) === 'cases'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Cases ({dept.caseCount})
                  </button>
                </div>

                <div className="p-6">
                  {/* Personnel Tab */}
                  {getTab(dept.name) === 'users' && (
                    <div className="overflow-x-auto">
                      {dept.users.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No personnel assigned to this department</p>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dept.users.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                    user.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' :
                                    user.role === 'DETECTIVE' ? 'bg-green-100 text-green-800' :
                                    user.role === 'OFFICER' ? 'bg-yellow-100 text-yellow-800' :
                                    user.role === 'FORENSIC_TECH' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {getRoleDisplayName(user.role as any)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{user.badge || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Cases Tab */}
                  {getTab(dept.name) === 'cases' && (
                    <div className="overflow-x-auto">
                      {dept.cases.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No cases assigned to this department</p>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dept.cases.map((c) => (
                              <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.title}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    statusColors[c.status] || 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {c.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    priorityColors[c.priority] || 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {c.priority}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{c.evidenceCount}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}

        {data?.departments.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments Found</h3>
            <p className="text-gray-600">
              Departments are automatically created when users are assigned to them.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
