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
  ShieldAlert,
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
import TamperDetector from "@/components/evidence/TamperDetector"
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
  isTampered?: boolean
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
  isChainValid?: boolean
  integrityCheckDetails?: {
    calculatedRoot: string | null
    storedRoot: string | null
    mismatch: boolean
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
  const [verifyingEvidenceId, setVerifyingEvidenceId] = useState<string | null>(null)

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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back Button */}
        <div className="mb-3 sm:mb-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/cases')}
            className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
        </div>
        
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022b3a] mb-2">{case_.title}</h1>
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#1f7a8c]/60" />
              <span className="text-xs sm:text-sm text-[#022b3a]/60 font-mono">
                Case Number: {case_.caseNumber}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(case_.status)}`}>
                {case_.status.replace('_', ' ')}
              </span>
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getPriorityColor(case_.priority)}`}>
                {case_.priority}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] hover:from-[#022b3a] hover:to-[#1f7a8c] text-white text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Evidence
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/cases/${case_.id}/edit`)}
              className="border border-[#022b3a]/30 bg-white text-[#022b3a] hover:bg-[#022b3a]/10 hover:border-[#022b3a]/40 hover:text-[#022b3a] active:scale-95 transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Case
            </Button>
          </div>
        </div>
      </div>

      {/* Chain Integrity Warning (Scenario B: Database Tampering) */}
      {case_ && case_.isChainValid === false && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm animate-pulse">
          <div className="flex items-start">
            <ShieldAlert className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-800">CRITICAL SECURITY ALERT: Chain Integrity Compromised</h3>
              <p className="text-red-700 mt-1">
                The cryptographic integrity of this case has been violated. The Merkle Root stored in the immutable ledger 
                does not match the current database records.
              </p>
              <div className="mt-3 text-sm bg-white/50 p-3 rounded border border-red-100 font-mono text-red-900">
                <p>Expected Root: {case_.integrityCheckDetails?.storedRoot}</p>
                <p>Calculated Root: {case_.integrityCheckDetails?.calculatedRoot}</p>
              </div>
              <p className="mt-2 text-sm text-red-600 font-medium">
                This indicates that evidence data in the database has been manually altered or corrupted. 
                Evidence in this case cannot be trusted until the discrepancy is resolved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Case Information */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Case Details Card */}
          <Card className="p-4 sm:p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-[#022b3a] mb-4 sm:mb-6">Case Information</h2>
            
            {/* Description - Full Width */}
            <div className="mb-4 sm:mb-6">
              <label className="text-xs sm:text-sm font-medium text-[#022b3a]/70">Description</label>
              <div className="mt-2 bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 rounded-lg border border-[#1f7a8c]/10">
                <div className="relative p-3 sm:p-4">
                  <p className={`text-sm sm:text-base text-[#022b3a] whitespace-pre-wrap break-words leading-relaxed ${!isDescriptionExpanded && case_.description.length > 200 ? 'line-clamp-3' : ''}`}>
                    {case_.description}
                  </p>
                </div>
                {case_.description.length > 200 && (
                  <div className="px-3 sm:px-4 pb-3 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }}
                      className="flex items-center text-xs sm:text-sm font-medium text-[#1f7a8c] hover:text-[#022b3a] transition-colors"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Show More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="text-xs sm:text-sm font-medium text-[#022b3a]/70">Category</label>
                <p className="mt-1 text-sm sm:text-base text-[#022b3a]">{case_.category}</p>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-[#022b3a]/70">Location</label>
                <div className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#1f7a8c] mr-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-[#022b3a] truncate">{case_.location}</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-[#022b3a]/70">Assigned To</label>
                <div className="flex items-center mt-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-[#1f7a8c] mr-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-[#022b3a] truncate">{case_.User?.name || case_.User?.email || case_.officerId}</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-[#022b3a]/70">Created</label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#1f7a8c] mr-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-[#022b3a]">{new Date(case_.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-[#022b3a]/70">Last Updated</label>
                <div className="flex items-center mt-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-[#1f7a8c] mr-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-[#022b3a]">{new Date(case_.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Evidence Section */}
          <Card className="p-4 sm:p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#022b3a]">Evidence ({case_.evidence.length})</h2>
              <Button 
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Evidence
              </Button>
            </div>

            {case_.evidence.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-[#1f7a8c]/30 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-[#022b3a]/60 mb-3 sm:mb-4">No evidence uploaded yet</p>
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Evidence
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {case_.evidence.map((evidence) => (
                  <div key={evidence.id} className={`border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow ${evidence.isTampered ? 'border-red-500 bg-red-50' : 'border-[#1f7a8c]/20'}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <FileText className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${evidence.isTampered ? 'text-red-500' : 'text-[#1f7a8c]'}`} />
                          <h3 className={`font-semibold text-sm sm:text-base break-all ${evidence.isTampered ? 'text-red-700' : 'text-[#022b3a]'}`}>{evidence.filename}</h3>
                          {evidence.verified && !evidence.isTampered && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          {evidence.isTampered && (
                            <div className="flex items-center text-red-600 text-xs font-bold bg-red-100 px-2 py-0.5 rounded-full">
                               <AlertCircle className="h-3 w-3 mr-1" />
                               TAMPERED
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-[#022b3a]/70 mb-3">
                          <div>
                            <span className="font-medium">Type:</span> {evidence.evidenceType}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {formatBytes(evidence.filesize)}
                          </div>
                          <div>
                            <span className="font-medium">Collected:</span> {new Date(evidence.collectedAt).toLocaleDateString()}
                          </div>
                          <div className="truncate">
                            <span className="font-medium">By:</span> {evidence.collectedBy}
                          </div>
                        </div>
                        
                        {evidence.notes && (
                          <p className="text-xs sm:text-sm text-[#022b3a]/80 mb-3">{evidence.notes}</p>
                        )}
                        
                        {evidence.tags && evidence.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {evidence.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-0.5 sm:py-1 bg-[#1f7a8c]/10 text-[#1f7a8c] text-[10px] sm:text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {evidence.merkleRoot && (
                          <div className="flex items-center text-xs sm:text-sm text-[#022b3a]/70 mb-2">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>Merkle ledger verified</span>
                          </div>
                        )}
                        
                        {evidence.ipfsCid && (
                          <div className="flex items-center text-xs sm:text-sm text-[#022b3a]/70">
                            <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-[#1f7a8c] mr-2 flex-shrink-0" />
                            <span className="font-mono text-[10px] sm:text-xs break-all">{evidence.ipfsCid}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex sm:flex-col gap-2 sm:ml-4">
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
                            className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200 flex-1 sm:flex-none"
                          >
                            <Eye className="h-4 w-4 sm:mr-0" />
                            <span className="sm:hidden ml-2">View</span>
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
                          className="border border-[#022b3a]/30 bg-white text-[#022b3a] hover:bg-[#022b3a]/10 hover:border-[#022b3a]/40 hover:text-[#022b3a] active:scale-95 transition-colors duration-200 flex-1 sm:flex-none"
                        >
                          <Download className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Download</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVerifyingEvidenceId(verifyingEvidenceId === evidence.id ? null : evidence.id)}
                          className={`border ${verifyingEvidenceId === evidence.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-[#022b3a]/30 bg-white text-[#022b3a]'} hover:bg-[#022b3a]/10 hover:border-[#022b3a]/40 hover:text-[#022b3a] active:scale-95 transition-colors duration-200 flex-1 sm:flex-none`}
                        >
                          <ShieldAlert className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Verify</span>
                        </Button>
                      </div>
                    </div>
                    
                    {verifyingEvidenceId === evidence.id && (
                      <TamperDetector 
                        evidenceId={evidence.id} 
                        evidenceFilename={evidence.filename} 
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* AI Intelligence Engine */}
          <AIIntelligenceEngine caseId={case_.id} />

          {/* Evidence Chain Integrity Status */}
          <Card className="p-3 sm:p-4 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#1f7a8c]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#022b3a]">Chain Integrity</h3>
              </div>
              {case_.merkleRoot ? (
                (case_.isChainValid !== false && case_.evidence.length > 0 && case_.evidence.every(e => e.verified)) ? (
                  <div className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-[10px] sm:text-xs font-semibold text-green-700">✓ Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-red-100 border border-red-200 rounded-full">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    <span className="text-[10px] sm:text-xs font-semibold text-red-700">
                       {case_.isChainValid === false ? "⚠ DB Tampered" : "✗ Tampered"}
                    </span>
                  </div>
                )
              ) : (
                <div className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-gray-100 border border-gray-200 rounded-full">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-700">Pending</span>
                </div>
              )}
            </div>
            {case_.merkleRoot && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#1f7a8c]/10">
                <p className="text-[10px] sm:text-xs text-[#022b3a]/60 mb-1">Evidence Status:</p>
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-[#022b3a]/70">
                    {case_.evidence.filter(e => e.verified && !e.isTampered).length} / {case_.evidence.length} verified
                  </span>
                  <span className={`font-semibold ${
                    case_.evidence.every(e => e.verified && !e.isTampered) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {((case_.evidence.filter(e => e.verified && !e.isTampered).length / case_.evidence.length) * 100).toFixed(0)}%
                  </span>
                </div>
                
                {case_.isChainValid === false && (
                   <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-[10px] sm:text-xs text-red-800">
                      <strong>CRITICAL:</strong> Database records do not match the immutable Case Merkle Root.
                   </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-4 sm:p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-[#022b3a] mb-3 sm:mb-4">Quick Stats</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-[#022b3a]/70">Total Evidence</span>
                <span className="font-semibold text-sm sm:text-base text-[#022b3a]">{case_.evidence.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-[#022b3a]/70">Verified Items</span>
                <span className="font-semibold text-sm sm:text-base text-[#022b3a]">
                  {case_.evidence.filter(e => e.verified).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-[#022b3a]/70">Merkle Records</span>
                <span className="font-semibold text-sm sm:text-base text-[#022b3a]">
                  {case_.evidence.filter(e => e.merkleRoot).length}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-[#022b3a]/70">Case Merkle Root</span>
                <span className="font-mono text-[10px] sm:text-xs text-[#022b3a] max-w-[120px] sm:max-w-[180px] text-right break-all">
                  {case_.merkleRoot ?? 'Pending'}
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4 sm:p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-[#022b3a] mb-3 sm:mb-4">Recent Activity</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 bg-[#1f7a8c] rounded-full flex-shrink-0"></div>
                <div className="text-xs sm:text-sm">
                  <p className="text-[#022b3a]">Case updated</p>
                  <p className="text-[#022b3a]/60">{new Date(case_.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 bg-[#022b3a] rounded-full flex-shrink-0"></div>
                <div className="text-xs sm:text-sm">
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
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#022b3a]">Add Evidence</h2>
              <Button 
                variant="outline"
                onClick={() => setShowUploadForm(false)}
                className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200 text-sm sm:text-base"
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
