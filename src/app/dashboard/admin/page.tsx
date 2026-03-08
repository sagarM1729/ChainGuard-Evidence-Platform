'use client'

import { useSession } from 'next-auth/react'
import { hasPermission, getRoleDisplayName } from '@/lib/rbac'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Users, 
  Building2, 
  FileText, 
  Activity,
  UserCheck,
  Settings,
  AlertTriangle,
  Server,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  badge: string
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [activeCaseCount, setActiveCaseCount] = useState<number | null>(null)
  const [totalEvidence, setTotalEvidence] = useState<number | null>(null)
  const [recentActivityCount, setRecentActivityCount] = useState<number | null>(null)
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
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
    
    fetchUsers()
    fetchDepartmentStats()
    fetchSystemStats()
  }, [session, status, router])
  
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartmentStats = async () => {
    try {
      const response = await fetch('/api/admin/departments')
      if (response.ok) {
        const data = await response.json()
        const totalActive = data.departments.reduce(
          (sum: number, d: { activeCases: number }) => sum + d.activeCases,
          0
        )
        setActiveCaseCount(totalActive)
        setTotalEvidence(data.summary.totalEvidence)
      }
    } catch (error) {
      console.error('Error fetching department stats:', error)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/system')
      if (response.ok) {
        const data = await response.json()
        setSystemHealthy(data.database.healthy)
        setRecentActivityCount(data.overview.activitiesLast24h)
      }
    } catch (error) {
      console.error('Error fetching system stats:', error)
    }
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
  
  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {session.user.name} ({getRoleDisplayName(session.user.role)})
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(users.map(u => u.department)).size}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-3xl font-bold text-gray-900">{activeCaseCount !== null ? activeCaseCount : '-'}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evidence Items</p>
              <p className="text-3xl font-bold text-gray-900">{totalEvidence !== null ? totalEvidence : '-'}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              {systemHealthy === null ? (
                <p className="text-sm font-medium text-gray-400">Checking...</p>
              ) : systemHealthy ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-600">Operational</p>
                </div>
              ) : (
                <p className="text-sm font-medium text-red-600">Degraded</p>
              )}
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          {recentActivityCount !== null && (
            <p className="text-xs text-gray-400 mt-2">{recentActivityCount} events in last 24h</p>
          )}
        </Card>
      </div>
      
      {/* Role Distribution */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Role Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(roleStats).map(([role, count]) => (
            <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{getRoleDisplayName(role as any)}</div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 flex flex-col">
          <UserCheck className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-gray-600 mb-4 flex-1">Manage user accounts, roles, and departments</p>
          <Button 
            onClick={() => router.push('/dashboard/admin/users')}
            className="w-full"
          >
            Manage Users
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col">
          <Building2 className="h-8 w-8 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Departments</h3>
          <p className="text-gray-600 mb-4 flex-1">View department statistics and assignments</p>
          <Button 
            onClick={() => router.push('/dashboard/admin/departments')}
            className="w-full"
          >
            View Departments
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col">
          <Activity className="h-8 w-8 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
          <p className="text-gray-600 mb-4 flex-1">System activity and access logs</p>
          <Button 
            onClick={() => router.push('/dashboard/admin/activities')}
            className="w-full"
          >
            View Logs
          </Button>
        </Card>

        <Card className="p-6 flex flex-col">
          <Server className="h-8 w-8 text-teal-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">System Monitor</h3>
          <p className="text-gray-600 mb-4 flex-1">Platform health, analytics, and performance</p>
          <Button 
            onClick={() => router.push('/dashboard/admin/system')}
            className="w-full"
          >
            View System
          </Button>
        </Card>
      </div>
      
      {/* Recent Users */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 10).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.badge}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}