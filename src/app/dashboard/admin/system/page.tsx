'use client'

import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/rbac'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import {
  Activity,
  AlertTriangle,
  Shield,
  Database,
  HardDrive,
  Users,
  FileText,
  Briefcase,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Server,
  BarChart3,
  LogIn,
} from 'lucide-react'

interface SystemData {
  database: {
    healthy: boolean
    totalRecords: number
  }
  overview: {
    totalUsers: number
    totalCases: number
    totalEvidence: number
    totalActivities: number
    activitiesLast24h: number
    loginsLast24h: number
  }
  storage: {
    totalFiles: number
    totalSizeBytes: number
  }
  distributions: {
    casesByStatus: { status: string; count: number }[]
    evidenceByType: { type: string; count: number }[]
    usersByRole: { role: string; count: number }[]
    activityByType: { type: string; count: number }[]
  }
  activityTrend: { date: string; count: number }[]
  serverTime: string
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  CLOSED: 'bg-gray-400',
  COLD_CASE: 'bg-purple-500',
  ARCHIVED: 'bg-slate-400',
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function SystemMonitoringPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchSystemData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/system')
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Error fetching system data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/login'); return }
    if (!hasPermission(session.user.role, 'ACCESS_ADMIN_PANEL')) { router.push('/dashboard'); return }
    fetchSystemData()
  }, [session, status, router, fetchSystemData])

  if (status === 'loading' || (loading && !data)) {
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
          <p className="text-gray-600 mb-4">Admin role required.</p>
          <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
        </Card>
      </div>
    )
  }

  const maxTrend = Math.max(...(data?.activityTrend.map(d => d.count) || [1]), 1)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin', icon: <Shield className="h-4 w-4" /> },
          { label: 'System Monitoring' },
        ]}
        className="mb-4"
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">System Monitoring</h1>
          <p className="text-gray-600">
            Platform health, performance metrics, and system analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" onClick={fetchSystemData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status Banner */}
      <Card className={`p-4 mb-8 border-l-4 ${
        data?.database.healthy ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
      }`}>
        <div className="flex items-center gap-3">
          {data?.database.healthy ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">All Systems Operational</p>
                <p className="text-sm text-green-600">
                  Database connected &middot; {data.database.totalRecords.toLocaleString()} total records &middot; Server time: {new Date(data.serverTime).toLocaleString()}
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">System Issue Detected</p>
                <p className="text-sm text-red-600">Database connection may be degraded</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{data?.overview.totalUsers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900">{data?.overview.totalCases || 0}</p>
            </div>
            <Briefcase className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evidence Items</p>
              <p className="text-3xl font-bold text-gray-900">{data?.overview.totalEvidence || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatBytes(data?.storage.totalSizeBytes || 0)}
              </p>
            </div>
            <HardDrive className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Activity Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Activities (24h)</h3>
          </div>
          <p className="text-4xl font-bold text-indigo-600">{data?.overview.activitiesLast24h || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            of {(data?.overview.totalActivities || 0).toLocaleString()} total
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <LogIn className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Logins (24h)</h3>
          </div>
          <p className="text-4xl font-bold text-emerald-600">{data?.overview.loginsLast24h || 0}</p>
          <p className="text-sm text-gray-500 mt-1">user authentication events</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Database Records</h3>
          </div>
          <p className="text-4xl font-bold text-teal-600">{(data?.database.totalRecords || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">across all tables</p>
        </Card>
      </div>

      {/* Activity Trend Chart (Bar chart with CSS) */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Activity Trend (Last 7 Days)</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {data?.activityTrend.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-600">{day.count}</span>
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-500"
                style={{
                  height: `${Math.max((day.count / maxTrend) * 100, 4)}%`,
                  minHeight: '4px',
                }}
              />
              <span className="text-xs text-gray-400">
                {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cases by Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cases by Status</h3>
          </div>
          <div className="space-y-3">
            {data?.distributions.casesByStatus.map(({ status: s, count }) => {
              const total = data.overview.totalCases || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{s.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${statusColors[s] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {(!data?.distributions.casesByStatus || data.distributions.casesByStatus.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">No case data available</p>
            )}
          </div>
        </Card>

        {/* Users by Role */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
          </div>
          <div className="space-y-3">
            {data?.distributions.usersByRole.map(({ role, count }) => {
              const total = data.overview.totalUsers || 1
              const pct = Math.round((count / total) * 100)
              const roleColors: Record<string, string> = {
                ADMIN: 'bg-red-500',
                SUPERVISOR: 'bg-blue-500',
                DETECTIVE: 'bg-green-500',
                OFFICER: 'bg-yellow-500',
                FORENSIC_TECH: 'bg-purple-500',
                READONLY: 'bg-gray-400',
              }
              return (
                <div key={role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{role.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${roleColors[role] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Evidence by Type */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Evidence by Type</h3>
          </div>
          <div className="space-y-3">
            {data?.distributions.evidenceByType.map(({ type, count }) => {
              const total = data.overview.totalEvidence || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{type.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {(!data?.distributions.evidenceByType || data.distributions.evidenceByType.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">No evidence data available</p>
            )}
          </div>
        </Card>

        {/* Top Activity Types (7 days) */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Activity Types (7 Days)</h3>
          </div>
          <div className="space-y-3">
            {data?.distributions.activityByType
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map(({ type, count }) => {
                const maxCount = data.distributions.activityByType[0]?.count || 1
                const pct = Math.round((count / maxCount) * 100)
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{type.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            {(!data?.distributions.activityByType || data.distributions.activityByType.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">No activity data available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
