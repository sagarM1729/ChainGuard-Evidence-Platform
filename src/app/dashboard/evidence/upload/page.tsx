"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UploadForm from "@/components/evidence/UploadForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FolderOpen } from "lucide-react"

interface Case {
  id: string
  title: string
  description: string
}

export default function EvidenceUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchCases()
      // Check if case ID is provided in URL params
      const caseId = searchParams.get('caseId')
      if (caseId) {
        setSelectedCaseId(caseId)
      }
    }
  }, [status, router, searchParams])

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

  const handleUploadSuccess = (result: any) => {
    console.log("Evidence uploaded successfully:", result)
    // Redirect to evidence list or case details
    if (selectedCaseId) {
      router.push(`/dashboard/cases/${selectedCaseId}`)
    } else {
      router.push("/dashboard/cases")
    }
  }

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-[#1f7a8c] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#1f7a8c]">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href={selectedCaseId ? `/dashboard/cases/${selectedCaseId}` : "/dashboard/cases"}
            className="inline-flex items-center text-[#1f7a8c] hover:text-[#022b3a] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {selectedCaseId ? "Back to Case" : "Back to Cases"}
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Evidence</h1>
          <p className="text-gray-600">
            Upload evidence files with secure IPFS storage and blockchain verification
          </p>
        </div>

        {/* Case Selection */}
        {!selectedCaseId && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Case</h2>
              {cases.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No cases found. Create a case first.</p>
                  <Link href="/dashboard/cases/new">
                    <Button className="bg-[#1f7a8c] hover:bg-[#022b3a] text-white">
                      Create New Case
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cases.map((case_) => (
                    <div
                      key={case_.id}
                      onClick={() => setSelectedCaseId(case_.id)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#1f7a8c] hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{case_.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{case_.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Case Display */}
        {selectedCaseId && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Uploading to Case:</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {cases.find(c => c.id === selectedCaseId)?.title || selectedCaseId}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedCaseId("")}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Change Case
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        {selectedCaseId && (
          <UploadForm
            caseId={selectedCaseId}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          />
        )}
      </div>
    </div>
  )
}
