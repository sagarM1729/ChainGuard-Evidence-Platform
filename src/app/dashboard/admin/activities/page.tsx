'use client'

import { useSession } from 'next-auth/react'
import { hasPermission, getRoleDisplayName } from '@/lib/rbac'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  User,
  FileText,
  Shield,
  LogIn,
  LogOut,
  Upload,
  Trash2,
  CheckCircle,
  Eye,
  RefreshCw,
  XCircle,
  Download,
} from 'lucide-react'

interface ActivityUser {
  id: string
  name: string
  email: string
  role: string
  badge: string
  department: string
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  userId: string
  caseId: string | null
  evidenceId: string | null
  user: ActivityUser
}

interface TypeCount {
  type: string
  count: number
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

const activityTypeConfig: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  CASE_CREATED: { icon: FileText, color: 'bg-green-100 text-green-700', label: 'Case Created' },
  CASE_UPDATED: { icon: FileText, color: 'bg-blue-100 text-blue-700', label: 'Case Updated' },
  CASE_STATUS_CHANGED: { icon: RefreshCw, color: 'bg-yellow-100 text-yellow-700', label: 'Status Changed' },
  CASE_CLOSED: { icon: XCircle, color: 'bg-gray-100 text-gray-700', label: 'Case Closed' },
  EVIDENCE_UPLOADED: { icon: Upload, color: 'bg-indigo-100 text-indigo-700', label: 'Evidence Uploaded' },
  EVIDENCE_UPDATED: { icon: FileText, color: 'bg-blue-100 text-blue-700', label: 'Evidence Updated' },
  EVIDENCE_VERIFIED: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Evidence Verified' },
  EVIDENCE_ACCESSED: { icon: Eye, color: 'bg-cyan-100 text-cyan-700', label: 'Evidence Accessed' },
  EVIDENCE_DELETED: { icon: Trash2, color: 'bg-red-100 text-red-700', label: 'Evidence Deleted' },
  USER_LOGIN: { icon: LogIn, color: 'bg-emerald-100 text-emerald-700', label: 'User Login' },
  USER_LOGOUT: { icon: LogOut, color: 'bg-slate-100 text-slate-700', label: 'User Logout' },
  USER_CREATED: { icon: User, color: 'bg-green-100 text-green-700', label: 'User Created' },
  USER_UPDATED: { icon: User, color: 'bg-blue-100 text-blue-700', label: 'User Updated' },
  USER_DELETED: { icon: Trash2, color: 'bg-red-100 text-red-700', label: 'User Deleted' },
  SYSTEM_BACKUP: { icon: Shield, color: 'bg-purple-100 text-purple-700', label: 'System Backup' },
  CHAIN_CUSTODY_VERIFIED: { icon: CheckCircle, color: 'bg-teal-100 text-teal-700', label: 'Custody Verified' },
  CUSTODY_REPORT_GENERATED: { icon: FileText, color: 'bg-orange-100 text-orange-700', label: 'Custody Report' },
}

export default function AuditTrailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, totalCount: 0, totalPages: 0 })
  const [typeCounts, setTypeCounts] = useState<TypeCount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchActivities = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' })
      if (selectedType) params.set('type', selectedType)
      if (searchQuery) params.set('search', searchQuery)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await fetch(`/api/admin/activities?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setActivities(result.activities)
        setPagination(result.pagination)
        setTypeCounts(result.typeCounts)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedType, searchQuery, dateFrom, dateTo])

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
    fetchActivities()
  }, [session, status, router, fetchActivities])

  const handleSearch = () => {
    fetchActivities(1)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(prev => prev === type ? '' : type)
  }

  const handleClearFilters = () => {
    setSelectedType('')
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
  }

  const handleExportCSV = async () => {
    const params = new URLSearchParams()
    if (selectedType) params.set('type', selectedType)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    window.open(`/api/admin/activities/export?${params.toString()}`, '_blank')
  }

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActivityConfig = (type: string) => {
    return activityTypeConfig[type] || { icon: Activity, color: 'bg-gray-100 text-gray-700', label: type.replace(/_/g, ' ') }
  }

  if (status === 'loading') {
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
          { label: 'Audit Trail' },
        ]}
        className="mb-4"
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Audit Trail</h1>
          <p className="text-gray-600">
            Complete system activity log with {pagination.totalCount.toLocaleString()} recorded events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(selectedType || searchQuery || dateFrom || dateTo) && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                {[selectedType, searchQuery, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <Button variant="outline" onClick={handleClearFilters} className="text-sm">
              Clear All
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, user name, or email..."
                className="flex-1"
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Activity Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
            <div className="flex flex-wrap gap-2">
              {typeCounts.map(({ type, count }) => {
                const config = getActivityConfig(type)
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedType === type
                        ? 'ring-2 ring-blue-500 ring-offset-1'
                        : ''
                    } ${config.color}`}
                  >
                    {config.label}
                    <span className="opacity-70">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Activity List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-600">
              {selectedType || searchQuery || dateFrom || dateTo
                ? 'Try adjusting your filters to see more results.'
                : 'System activities will appear here as users interact with the platform.'}
            </p>
          </div>
        ) : (
          <>
            {/* Activity Items */}
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => {
                const config = getActivityConfig(activity.type)
                const IconComponent = config.icon
                return (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg flex-shrink-0 ${config.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </span>
                        </div>

                        {activity.description && (
                          <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.user.name || activity.user.email}
                            {activity.user.department && (
                              <span className="text-gray-400">({activity.user.department})</span>
                            )}
                          </span>
                          {activity.user.role && (
                            <span className={`inline-flex px-1.5 py-0.5 text-xs rounded ${
                              activity.user.role === 'ADMIN' ? 'bg-red-50 text-red-600' :
                              activity.user.role === 'SUPERVISOR' ? 'bg-blue-50 text-blue-600' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {getRoleDisplayName(activity.user.role as any)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(activity.createdAt)}
                          </span>
                        </div>

                        {/* Metadata preview */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                              View metadata
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto text-gray-600">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount.toLocaleString()} events
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fetchActivities(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum: number
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchActivities(pageNum)}
                          className={`px-3 py-1 rounded text-sm ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fetchActivities(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
