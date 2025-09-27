"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Files, Users, AlertCircle, TrendingUp, Plus, Eye, Clock, Star } from "lucide-react"
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
    } finally {
      setLoading(false)
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
      case 'ARCHIVED': return 'text-gray-500 bg-gray-50 border-gray-100'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#022b3a] mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Officer'}!
        </h1>
        <p className="text-[#022b3a]/70">
          Here&apos;s what&apos;s happening with your evidence management today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
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

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
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

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
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

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
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
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#022b3a]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#022b3a]">Recent Cases</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/cases')}
              className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
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
            <div className="space-y-4">
              {recentCases.map((case_) => (
                <Card key={case_.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-[#1f7a8c]/20">
                  <div 
                    className="flex justify-between items-start"
                    onClick={() => router.push(`/dashboard/cases/${case_.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-[#022b3a] line-clamp-1">{case_.title}</h3>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(case_.priority)}`}>
                            {case_.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(case_.status)}`}>
                            {case_.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-[#022b3a]/60">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(case_.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Files className="h-4 w-4 mr-1" />
                            {case_.evidenceCount} evidence
                          </span>
                        </div>
                        <Eye className="h-4 w-4 text-[#1f7a8c]" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Files className="h-12 w-12 text-[#1f7a8c]/30 mx-auto mb-4" />
              <p className="text-[#022b3a]/60">No cases yet. Create your first case to get started.</p>
              <Button 
                onClick={() => router.push('/dashboard/cases/new')}
                className="mt-4 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
              >
                Create Case
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
          <h2 className="text-xl font-bold text-[#022b3a] mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#1f7a8c]/10">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#1f7a8c] rounded-full"></div>
                <div>
                  <p className="font-medium text-[#022b3a]">New evidence uploaded to Case #2023-001</p>
                  <p className="text-sm text-[#022b3a]/60">2 hours ago</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-[#1f7a8c]/10">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#022b3a] rounded-full"></div>
                <div>
                  <p className="font-medium text-[#022b3a]">Case #2023-002 status updated to Closed</p>
                  <p className="text-sm text-[#022b3a]/60">5 hours ago</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#bfdbf7] rounded-full"></div>
                <div>
                  <p className="font-medium text-[#022b3a]">Chain of custody verified for Evidence #EV-001</p>
                  <p className="text-sm text-[#022b3a]/60">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
