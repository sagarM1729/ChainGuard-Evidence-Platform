"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  Download, 
  Eye, 
  Shield, 
  Hash,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ComprehensiveUploadForm from "@/components/evidence/ComprehensiveUploadForm"
import AIIntelligenceEngine from "@/components/cases/AIIntelligenceEngine"
import type { MerkleProof } from "@/lib/merkle"

interface Evidence {
  id: string
  filename: string
  filetype: string
  filesize: number
  notes: string
  evidenceType: string
  category: string
  tags: string[]
  collectedAt: string
  collectedBy: string
  location: string
  ipfsCid?: string
  retrievalUrl?: string
  merkleRoot?: string
  merkleProof?: MerkleProof
  verified: boolean
}

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
  merkleRoot?: string
  evidence: Evidence[]
  User?: {
    id: string
    name: string | null
    email: string
  }
}

export default function CaseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params?.caseId as string

  const [case_, setCase] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const fetchCaseDetails = useCallback(async () => {
    if (!caseId) {
      return
    }

    try {
      const response = await fetch(`/api/cases/${caseId}`)
      if (response.ok) {
        const caseData = await response.json()
        setCase(caseData)
      } else {
        setError('Case not found')
      }
    } catch (error) {
      console.error('Failed to fetch case details:', error)
      setError('Failed to fetch case details')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails()
    }
  }, [caseId, fetchCaseDetails])

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleEvidenceUploaded = () => {
    setShowUploadForm(false)
    fetchCaseDetails() // Refresh case data
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
          <div className="bg-gray-200 h-4 w-3/4 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-200 h-64 rounded-2xl"></div>
            </div>
            <div>
              <div className="bg-gray-200 h-64 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !case_) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#022b3a] mb-2">
            {error || 'Case not found'}
          </h3>
          <Button 
            onClick={() => router.push('/dashboard/cases')}
            className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/cases')}
              className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#022b3a]">{case_.title}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(case_.status)}`}>
                  {case_.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(case_.priority)}`}>
                  {case_.priority}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] hover:from-[#022b3a] hover:to-[#1f7a8c] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Evidence
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/cases/${case_.id}/edit`)}
              className="border border-[#022b3a]/30 bg-white text-[#022b3a] hover:bg-[#022b3a]/10 hover:border-[#022b3a]/40 hover:text-[#022b3a] active:scale-95 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Case
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Case Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Case Details Card */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h2 className="text-xl font-bold text-[#022b3a] mb-6">Case Information</h2>
            
            {/* Description - Full Width */}
            <div className="mb-6">
              <label className="text-sm font-medium text-[#022b3a]/70">Description</label>
              <div className="mt-2 bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 rounded-lg border border-[#1f7a8c]/10">
                <div className="relative p-4">
                  <p className={`text-[#022b3a] whitespace-pre-wrap break-words leading-relaxed ${!isDescriptionExpanded && case_.description.length > 300 ? 'line-clamp-4' : ''}`}>
                    {case_.description}
                  </p>
                </div>
                {case_.description.length > 300 && (
                  <div className="px-4 pb-3 pt-0">
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="flex items-center text-sm font-medium text-[#1f7a8c] hover:text-[#022b3a] transition-colors"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-[#022b3a]/70">Category</label>
                <p className="mt-1 text-[#022b3a]">{case_.category}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#022b3a]/70">Location</label>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 text-[#1f7a8c] mr-1" />
                  <span className="text-[#022b3a]">{case_.location}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#022b3a]/70">Assigned To</label>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 text-[#1f7a8c] mr-1" />
                  <span className="text-[#022b3a]">{case_.User?.name || case_.User?.email || case_.officerId}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#022b3a]/70">Created</label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-[#1f7a8c] mr-1" />
                  <span className="text-[#022b3a]">{new Date(case_.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#022b3a]/70">Last Updated</label>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-[#1f7a8c] mr-1" />
                  <span className="text-[#022b3a]">{new Date(case_.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Evidence Section */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#022b3a]">Evidence ({case_.evidence.length})</h2>
              <Button 
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Evidence
              </Button>
            </div>

            {case_.evidence.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-[#1f7a8c]/30 mx-auto mb-4" />
                <p className="text-[#022b3a]/60 mb-4">No evidence uploaded yet</p>
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Evidence
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {case_.evidence.map((evidence) => (
                  <div key={evidence.id} className="border border-[#1f7a8c]/20 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-5 w-5 text-[#1f7a8c]" />
                          <h3 className="font-semibold text-[#022b3a]">{evidence.filename}</h3>
                          {evidence.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#022b3a]/70 mb-3">
                          <div>
                            <span className="font-medium">Type:</span> {evidence.evidenceType}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {formatBytes(evidence.filesize)}
                          </div>
                          <div>
                            <span className="font-medium">Collected:</span> {new Date(evidence.collectedAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">By:</span> {evidence.collectedBy}
                          </div>
                        </div>
                        
                        {evidence.notes && (
                          <p className="text-sm text-[#022b3a]/80 mb-3">{evidence.notes}</p>
                        )}
                        
                        {evidence.tags && evidence.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {evidence.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-[#1f7a8c]/10 text-[#1f7a8c] text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {evidence.merkleRoot && (
                          <div className="flex items-center text-sm text-[#022b3a]/70 mb-2">
                            <Shield className="h-4 w-4 text-green-500 mr-2" />
                            <span>Merkle ledger verified</span>
                          </div>
                        )}
                        
                        {evidence.ipfsCid && (
                          <div className="flex items-center text-sm text-[#022b3a]/70">
                            <Hash className="h-4 w-4 text-[#1f7a8c] mr-2" />
                            <span className="font-mono text-xs">{evidence.ipfsCid}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {evidence.retrievalUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Check if it's a mock/local URL
                              if (evidence.retrievalUrl?.startsWith('local://') || evidence.retrievalUrl?.includes('local_')) {
                                alert('This evidence file is stored locally and cannot be viewed online. The original upload to IPFS failed, but the evidence metadata was saved.')
                              } else {
                                window.open(evidence.retrievalUrl, '_blank')
                              }
                            }}
                            className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (evidence.retrievalUrl) {
                              // Check if it's a mock/local URL
                              if (evidence.retrievalUrl.startsWith('local://') || evidence.retrievalUrl.includes('local_')) {
                                alert('This evidence file is stored locally and cannot be downloaded. The original upload to IPFS failed, but the evidence metadata was saved.')
                              } else {
                                const link = document.createElement('a')
                                link.href = evidence.retrievalUrl
                                link.download = evidence.filename
                                link.click()
                              }
                            }
                          }}
                          className="border border-[#022b3a]/30 bg-white text-[#022b3a] hover:bg-[#022b3a]/10 hover:border-[#022b3a]/40 hover:text-[#022b3a] active:scale-95 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Intelligence Engine */}
          <AIIntelligenceEngine caseId={case_.id} />

          {/* Quick Stats */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#022b3a] mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#022b3a]/70">Total Evidence</span>
                <span className="font-semibold text-[#022b3a]">{case_.evidence.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#022b3a]/70">Verified Items</span>
                <span className="font-semibold text-[#022b3a]">
                  {case_.evidence.filter(e => e.verified).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#022b3a]/70">Merkle Records</span>
                <span className="font-semibold text-[#022b3a]">
                  {case_.evidence.filter(e => e.merkleRoot).length}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[#022b3a]/70">Case Merkle Root</span>
                <span className="font-mono text-xs text-[#022b3a] max-w-[180px] text-right break-all">
                  {case_.merkleRoot ?? 'Pending'}
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#022b3a] mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#1f7a8c] rounded-full"></div>
                <div className="text-sm">
                  <p className="text-[#022b3a]">Case updated</p>
                  <p className="text-[#022b3a]/60">{new Date(case_.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#022b3a] rounded-full"></div>
                <div className="text-sm">
                  <p className="text-[#022b3a]">Case created</p>
                  <p className="text-[#022b3a]/60">{new Date(case_.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#022b3a]">Add Evidence</h2>
              <Button 
                variant="outline"
                onClick={() => setShowUploadForm(false)}
                className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
              >
                Cancel
              </Button>
            </div>
            <ComprehensiveUploadForm 
              caseId={case_.id}
              onSuccess={handleEvidenceUploaded}
              onError={(error: string) => {
                console.error('Upload error:', error)
                setShowUploadForm(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
