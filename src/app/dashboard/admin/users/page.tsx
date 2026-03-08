'use client'

import { useSession } from 'next-auth/react'
import { hasPermission, getRoleDisplayName } from '@/lib/rbac'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CreateUserModal from '@/components/admin/CreateUserModal'
import EditUserModal from '@/components/admin/EditUserModal'
import DeleteUserModal from '@/components/admin/DeleteUserModal'
import ResetPasswordModal from '@/components/admin/ResetPasswordModal'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Key
} from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  department: string | null
  badge: string | null
  createdAt: string
  updatedAt: string
}

interface UserFilters {
  role: string
  department: string
  search: string
}

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    department: 'all',
    search: ''
  })

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkRoleTarget, setBulkRoleTarget] = useState('')
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Available roles and departments
  const roles = ['ADMIN', 'SUPERVISOR', 'DETECTIVE', 'OFFICER', 'FORENSIC_TECH', 'READONLY']
  const departments = [
    'Administration', 
    'Homicide Division', 
    'Patrol Division', 
    'Cybercrime Division', 
    'Narcotics Division', 
    'Forensics Department', 
    'Internal Affairs'
  ]

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }
    
    if (!hasPermission(session.user.role, 'VIEW_ALL_USERS')) {
      router.push('/dashboard')
      return
    }
    
    fetchUsers()
  }, [session, status, router])

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...users]

      if (filters.role !== 'all') {
        filtered = filtered.filter(user => user.role === filters.role)
      }

      if (filters.department !== 'all') {
        filtered = filtered.filter(user => user.department === filters.department)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.badge?.toLowerCase().includes(searchLower)
        )
      }

      setFilteredUsers(filtered)
    }

    applyFilters()
  }, [users, filters])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error('Failed to fetch users:', response.status)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Modal handlers
  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchUsers()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleEditUserSubmit = async (userData: any) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  const handleResetPassword = (user: User) => {
    setSelectedUser(user)
    setShowResetPasswordModal(true)
  }

  const handleResetPasswordSubmit = async (newPassword: string) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })

      if (response.ok) {
        setShowResetPasswordModal(false)
        setSelectedUser(null)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  // Bulk operation handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)))
    }
  }

  const toggleSelectUser = (userId: string) => {
    const next = new Set(selectedIds)
    if (next.has(userId)) {
      next.delete(userId)
    } else {
      next.add(userId)
    }
    setSelectedIds(next)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} user(s)? This action cannot be undone.`
    )
    if (!confirmed) return

    setBulkActionLoading(true)
    let successCount = 0
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
        if (res.ok) successCount++
      } catch (e) {
        console.error(`Failed to delete user ${id}:`, e)
      }
    }
    setBulkActionLoading(false)
    setSelectedIds(new Set())
    fetchUsers()
    alert(`Successfully deleted ${successCount} of ${selectedIds.size} user(s).`)
  }

  const handleBulkRoleChange = async () => {
    if (selectedIds.size === 0 || !bulkRoleTarget) return
    const confirmed = window.confirm(
      `Change role of ${selectedIds.size} user(s) to ${getRoleDisplayName(bulkRoleTarget as any)}?`
    )
    if (!confirmed) return

    setBulkActionLoading(true)
    let successCount = 0
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: bulkRoleTarget })
        })
        if (res.ok) successCount++
      } catch (e) {
        console.error(`Failed to update user ${id}:`, e)
      }
    }
    setBulkActionLoading(false)
    setSelectedIds(new Set())
    setBulkRoleTarget('')
    fetchUsers()
    alert(`Successfully updated ${successCount} of ${selectedIds.size} user(s).`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !hasPermission(session.user.role, 'VIEW_ALL_USERS')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Admin role required to access user management.</p>
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
          { label: 'User Management' },
        ]}
        className="mb-4"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">
          Manage user accounts, roles, and permissions for the evidence platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.role !== 'READONLY').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Officers</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => ['OFFICER', 'DETECTIVE'].includes(u.role)).length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(users.map(u => u.department).filter(Boolean)).size}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{getRoleDisplayName(role as any)}</option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={() => fetchUsers()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {hasPermission(session.user.role, 'MANAGE_USERS') && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && hasPermission(session.user.role, 'MANAGE_USERS') && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.size} user(s) selected
            </span>
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={bulkRoleTarget}
                onChange={(e) => setBulkRoleTarget(e.target.value)}
                className="px-3 py-1.5 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Change role to...</option>
                {roles.map(role => (
                  <option key={role} value={role}>{getRoleDisplayName(role as any)}</option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleBulkRoleChange}
                disabled={!bulkRoleTarget || bulkActionLoading}
              >
                Apply Role
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-800 border-red-300"
                disabled={bulkActionLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {hasPermission(session.user.role, 'MANAGE_USERS') && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
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
                  Created
                </th>
                {hasPermission(session.user.role, 'MANAGE_USERS') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${selectedIds.has(user.id) ? 'bg-blue-50' : ''}`}>
                  {hasPermission(session.user.role, 'MANAGE_USERS') && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
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
                    {user.department || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.badge || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {hasPermission(session.user.role, 'MANAGE_USERS') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(user)}
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your filters</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onSubmit={handleEditUserSubmit}
        user={selectedUser}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUserConfirm}
        user={selectedUser}
      />

      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false)
          setSelectedUser(null)
        }}
        onSubmit={handleResetPasswordSubmit}
        user={selectedUser}
      />
    </div>
  )
}