'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Server,
} from 'lucide-react'
import { hasPermission } from '@/lib/rbac'
import { toast_warning } from '@/components/ui/Toast'

const adminNavItems = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/dashboard/admin/activities', label: 'Audit Trail', icon: Activity },
  { href: '/dashboard/admin/system', label: 'System', icon: Server },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.role || !hasPermission(session.user.role, 'ACCESS_ADMIN_PANEL')) {
      toast_warning("You don't have permission to access the admin panel")
      router.replace('/dashboard')
    }
  }, [session, status, router])

  const isActive = (item: typeof adminNavItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  // Don't render admin UI until we confirm access
  if (status === 'loading') return null
  if (!session?.user?.role || !hasPermission(session.user.role, 'ACCESS_ADMIN_PANEL')) return null

  return (
    <div>
      {/* Admin Sub-Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {adminNavItems.map(item => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  )
}
