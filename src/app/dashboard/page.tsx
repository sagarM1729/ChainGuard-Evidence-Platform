"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Files, Users, AlertCircle, TrendingUp, Plus, Eye, Clock, Star, Upload, Shield, FolderOpen, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CaseStats {
  totalCases: number
  totalEvidence: number
  activeOfficers: number
  pendingReviews: number
}

interface RecentCase {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  evidenceCount: number
}

interface Activity {
  id: string
  type: string
  title: string
  description?: string
  createdAt: string
  user?: {
    name: string | null
    email: string
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<CaseStats>({
    totalCases: 0,
    totalEvidence: 0,
    activeOfficers: 0,
    pendingReviews: 0
  })
  const [recentCases, setRecentCases] = useState<RecentCase[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/cases')
      if (response.ok) {
        const casesData = await response.json()
        // Handle different API response structures
        let cases = []
        if (Array.isArray(casesData)) {
          cases = casesData
        } else if (casesData.cases && Array.isArray(casesData.cases)) {
          cases = casesData.cases
        } else {
          console.warn('Unexpected API response structure:', casesData)
          cases = []
        }
        
        setStats({
          totalCases: cases.length,
          totalEvidence: cases.reduce((sum: number, c: any) => sum + (c.evidence?.length || 0), 0),
          activeOfficers: 12, // Static for now
          pendingReviews: cases.filter((c: any) => c.status === 'UNDER_REVIEW').length
        })
        
        // Sort by creation date and take first 5
        const sortedCases = cases
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            title: c.title,
            status: c.status,
            priority: c.priority,
            createdAt: c.createdAt,
            evidenceCount: c.evidence?.length || 0
          }))
        
        setRecentCases(sortedCases)
      } else {
        console.error('Failed to fetch cases:', response.status, response.statusText)
        setStats({
          totalCases: 0,
          totalEvidence: 0,
          activeOfficers: 12,
          pendingReviews: 0
        })
        setRecentCases([])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
    
    // Fetch activities
    await fetchActivities()
    
    setLoading(false)
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities?limit=5')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-200'
      case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'LOW': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'IN_PROGRESS': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'UNDER_REVIEW': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'CLOSED': return 'text-green-600 bg-green-100 border-green-200'
      case 'COLD_CASE': return 'text-gray-600 bg-gray-100 border-gray-200'
      case 'ARCHIVED': return 'text-slate-600 bg-slate-100 border-slate-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'CASE_CREATED':
      case 'CASE_UPDATED':
        return 'bg-[#1f7a8c]'
      case 'EVIDENCE_UPLOADED':
      case 'EVIDENCE_UPDATED':
        return 'bg-[#022b3a]'
      case 'EVIDENCE_VERIFIED':
      case 'CHAIN_CUSTODY_VERIFIED':
        return 'bg-green-500'
      case 'CASE_STATUS_CHANGED':
      case 'CASE_CLOSED':
        return 'bg-blue-500'
      default:
        return 'bg-[#bfdbf7]'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CASE_CREATED':
      case 'CASE_UPDATED':
        return <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#1f7a8c]" />
      case 'EVIDENCE_UPLOADED':
      case 'EVIDENCE_UPDATED':
        return <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#022b3a]" />
      case 'EVIDENCE_VERIFIED':
      case 'CHAIN_CUSTODY_VERIFIED':
        return <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      case 'CASE_CLOSED':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#022b3a]/60" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(dateString)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#022b3a] mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Officer'}!
        </h1>
        <p className="text-sm sm:text-base text-[#022b3a]/70">
          Here&apos;s what&apos;s happening with your evidence management today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Total Cases</p>
              <p className="text-2xl font-bold text-[#022b3a]">{loading ? '...' : stats.totalCases}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-xl">
              <Files className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Evidence Items</p>
              <p className="text-2xl font-bold text-[#022b3a]">{loading ? '...' : stats.totalEvidence}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Active Officers</p>
              <p className="text-2xl font-bold text-[#022b3a]">{stats.activeOfficers}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#bfdbf7] to-[#1f7a8c] rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#022b3a]/60 text-sm font-medium">Pending Reviews</p>
              <p className="text-2xl font-bold text-[#022b3a]">{loading ? '...' : stats.pendingReviews}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#1f7a8c] to-[#bfdbf7] rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#022b3a]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={() => router.push('/dashboard/cases/new')}
            className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] hover:from-[#022b3a] hover:to-[#1f7a8c] text-white p-6 h-auto rounded-2xl shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <Plus className="h-5 w-5" />
              <span className="font-medium">Create New Case</span>
            </div>
          </Button>
          
          <Button 
            onClick={() => router.push('/dashboard/cases')}
            variant="outline"
            className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] p-6 h-auto rounded-2xl shadow-xl transition-colors duration-200 hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3">
              <Files className="h-5 w-5" />
              <span className="font-medium">View All Cases</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#022b3a]">Recent Cases</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/cases')}
              className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              View All
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-16 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : recentCases.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentCases.map((case_) => (
                <Card key={case_.id} className="p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer border-[#1f7a8c]/20">
                  <div 
                    className="flex justify-between items-start"
                    onClick={() => router.push(`/dashboard/cases/${case_.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-[#022b3a] line-clamp-1">{case_.title}</h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full border ${getPriorityColor(case_.priority)}`}>
                            {case_.priority}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full border ${getStatusColor(case_.status)}`}>
                            {case_.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-[#022b3a]/60 space-y-1.5 sm:space-y-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {new Date(case_.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Files className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {case_.evidenceCount} evidence
                          </span>
                        </div>
                        <Eye className="hidden sm:block h-4 w-4 text-[#1f7a8c]" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Files className="h-10 w-10 sm:h-12 sm:w-12 text-[#1f7a8c]/30 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-[#022b3a]/60 mb-3 sm:mb-4">No cases yet. Create your first case to get started.</p>
              <Button 
                onClick={() => router.push('/dashboard/cases/new')}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white text-sm sm:text-base px-4 py-2"
              >
                Create Case
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-[#1f7a8c]/20 shadow-xl overflow-hidden">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#022b3a] mb-3 sm:mb-4 md:mb-6">Recent Activity</h2>
          {loading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="text-sm sm:text-base text-[#022b3a]/60">Loading activities...</div>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start sm:items-center justify-between py-2 sm:py-3 border-b border-[#1f7a8c]/10 last:border-b-0 gap-2 sm:gap-3">
                  <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0 overflow-hidden">
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${getActivityColor(activity.type)}`}></div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="font-medium text-xs sm:text-sm md:text-base text-[#022b3a] break-words line-clamp-2 sm:line-clamp-1">
                        {activity.description || activity.title}
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-[#022b3a]/60 mt-0.5 sm:mt-1 truncate">{getTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-1 sm:ml-2">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-10">
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-[#1f7a8c]/30 mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm md:text-base text-[#022b3a]/60 text-center">No recent activity</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-[#022b3a]/40 mt-1 text-center px-4">Activities will appear here as you work</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
