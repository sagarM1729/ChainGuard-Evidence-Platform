"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Filter, Eye, Edit, Calendar, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Case {
  id: string
  caseNumber: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'CLOSED' | 'COLD_CASE' | 'ARCHIVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category?: string
  location?: string
  createdAt: string
  updatedAt: string
  officerId: string
  _count: {
    evidence: number
  }
}

export default function AllCasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority'>('updatedAt')

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases')
      if (response.ok) {
        const casesData = await response.json()
        // Handle different API response structures
        if (Array.isArray(casesData)) {
          setCases(casesData)
        } else if (casesData.cases && Array.isArray(casesData.cases)) {
          setCases(casesData.cases)
        } else {
          console.warn('Unexpected API response structure:', casesData)
          setCases([])
        }
      } else {
        console.error('Failed to fetch cases:', response.status, response.statusText)
        setCases([])
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = (Array.isArray(cases) ? cases : []).filter(case_ => {
    const matchesSearch = 
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (case_.category && case_.category.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || case_.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || case_.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
  })

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': 
      case 'HIGH': 
        return <AlertCircle className="h-4 w-4" />
      default: 
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022b3a] mb-2">All Cases</h1>
            <p className="text-sm sm:text-base text-[#022b3a]/70">
              Manage and track all your investigation cases
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/cases/new')}
            className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] hover:from-[#022b3a] hover:to-[#1f7a8c] text-white shadow-xl w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Case
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[#1f7a8c]/20 shadow-xl mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#022b3a]/40" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 text-sm sm:text-base border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CLOSED">Closed</option>
              <option value="COLD_CASE">Cold Case</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
            >
              <option value="ALL">All Priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 pt-4 border-t border-[#1f7a8c]/10">
          <span className="text-xs sm:text-sm font-medium text-[#022b3a]">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'updatedAt', label: 'Last Updated' },
              { value: 'createdAt', label: 'Created Date' },
              { value: 'priority', label: 'Priority' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option.value as any)}
                className={`text-xs sm:text-sm ${sortBy === option.value 
                  ? "bg-[#1f7a8c] text-white" 
                  : "border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/95 rounded-2xl p-4 sm:p-6 border border-[#1f7a8c]/20 shadow-xl">
                <div className="bg-gray-200 h-5 sm:h-6 rounded mb-3 sm:mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-3 sm:mb-4"></div>
                <div className="flex justify-between">
                  <div className="bg-gray-200 h-6 w-16 rounded"></div>
                  <div className="bg-gray-200 h-6 w-20 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCases.map((case_) => (
            <Card key={case_.id} className="p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm">
              <div onClick={() => router.push(`/dashboard/cases/${case_.id}`)}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#022b3a] text-base sm:text-lg mb-1 line-clamp-2">
                      {case_.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#022b3a]/60 line-clamp-2 mb-2 sm:mb-3">
                      {case_.description}
                    </p>
                  </div>
                  <div className="flex items-center text-[#1f7a8c] ml-2">
                    {getPriorityIcon(case_.priority)}
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full border ${getStatusColor(case_.status)}`}>
                    {case_.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full border ${getPriorityColor(case_.priority)}`}>
                    {case_.priority}
                  </span>
                </div>

                {/* Case Details */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-center text-xs sm:text-sm text-[#022b3a]/60">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">#{case_.caseNumber}</span>
                  </div>
                  {case_.category && (
                    <div className="flex items-center text-xs sm:text-sm text-[#022b3a]/60">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{case_.category}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs sm:text-sm text-[#022b3a]/60">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span>Created {new Date(case_.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-[#022b3a]/60">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span>{case_._count?.evidence || 0} evidence items</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-[#1f7a8c]/10 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/cases/${case_.id}`)
                    }}
                    className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200 text-xs sm:text-sm flex-1"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/cases/${case_.id}/edit`)
                    }}
                    className="border border-[#022b3a]/30 bg-white text-[#022b3a] hover:bg-[#022b3a]/10 hover:border-[#022b3a]/40 hover:text-[#022b3a] active:scale-95 transition-colors duration-200 text-xs sm:text-sm flex-1"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-12 border border-[#1f7a8c]/20 shadow-xl max-w-md mx-auto">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-[#1f7a8c]/30 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold text-[#022b3a] mb-2">No Cases Found</h3>
            <p className="text-sm sm:text-base text-[#022b3a]/60 mb-4 sm:mb-6">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' 
                ? 'No cases match your current filters. Try adjusting your search criteria.' 
                : 'You haven\'t created any cases yet. Create your first case to get started.'
              }
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/dashboard/cases/new')}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white w-full text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Case
              </Button>
              {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                    setPriorityFilter('ALL')
                  }}
                  className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200 w-full text-sm sm:text-base"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}