"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, FolderOpen, Calendar, User, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Case {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  _count: {
    evidence: number
  }
}

export default function CasesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchCases()
    }
  }, [status, router])

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/cases")
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases || [])
      }
    } catch (error) {
      console.error("Error fetching cases:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = cases.filter(case_ =>
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-[#1f7a8c] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#1f7a8c]">Loading cases...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
            <p className="text-gray-600 mt-1">
              Manage your evidence cases and investigations
            </p>
          </div>
          <Link href="/dashboard/cases/new">
            <Button className="bg-[#1f7a8c] hover:bg-[#022b3a] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5" />
              Create New Case
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent"
            />
          </div>
        </div>

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {cases.length === 0 ? "No cases yet" : "No cases found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {cases.length === 0
                ? "Get started by creating your first case"
                : "Try adjusting your search terms"
              }
            </p>
            {cases.length === 0 && (
              <Link href="/dashboard/cases/new">
                <Button className="bg-[#1f7a8c] hover:bg-[#022b3a] text-white px-6 py-3 rounded-lg">
                  Create Your First Case
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((case_) => (
              <div key={case_.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {case_.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        case_.status
                      )}`}
                    >
                      {case_.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {case_.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created {formatDate(case_.createdAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-2" />
                      {case_._count.evidence} evidence items
                    </div>
                  </div>
                  
                  <Link href={`/dashboard/cases/${case_.id}`}>
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg py-2">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}