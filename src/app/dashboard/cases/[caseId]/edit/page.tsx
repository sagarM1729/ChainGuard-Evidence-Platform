"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Plus, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import UploadForm from "@/components/evidence/UploadForm"

interface Evidence {
  id: string
  filename: string
  filetype: string
  filesize: number
  notes: string
  evidenceType: 'DOCUMENT' | 'PHOTO' | 'VIDEO' | 'AUDIO' | 'PHYSICAL' | 'DIGITAL'
  category: string
  tags: string[]
  collectedAt: string
  collectedBy: string
  location: string
  ipfsCid?: string
  retrievalUrl?: string
  file?: File
}

interface CaseFormData {
  title: string
  description: string
  category: string
  customCategory?: string
  location: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'CLOSED' | 'COLD_CASE' | 'ARCHIVED'
  evidence: Evidence[]
}

export default function EditCasePage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params?.caseId as string

  const [formData, setFormData] = useState<CaseFormData>({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    location: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    evidence: []
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (caseId) {
      fetchCaseData()
    }
  }, [caseId])

  const fetchCaseData = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`)
      if (response.ok) {
        const caseData = await response.json()
        
        // Predefined categories list
        const predefinedCategories = [
          'Theft', 'Fraud', 'Assault', 'Homicide', 'Cybercrime', 
          'Drug Offense', 'Vandalism', 'Domestic Violence', 'Burglary', 'Traffic Violation'
        ]
        
        // Check if the category is custom
        const isCustomCategory = !predefinedCategories.includes(caseData.category)
        
        setFormData({
          title: caseData.title,
          description: caseData.description,
          category: isCustomCategory ? 'Other' : caseData.category,
          customCategory: isCustomCategory ? caseData.category : '',
          location: caseData.location,
          priority: caseData.priority,
          status: caseData.status,
          evidence: caseData.evidence || []
        })
      } else {
        setError('Case not found')
      }
    } catch (error) {
      console.error('Failed to fetch case:', error)
      setError('Failed to fetch case data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category === "Other" ? formData.customCategory : formData.category,
          location: formData.location,
          priority: formData.priority,
          status: formData.status
        })
      })

      if (response.ok) {
        router.push(`/dashboard/cases/${caseId}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update case')
      }
    } catch (error) {
      console.error('Failed to update case:', error)
      setError('Failed to update case')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEvidenceUploaded = () => {
    setShowUploadForm(false)
    fetchCaseData() // Refresh case data to show new evidence
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-8"></div>
          <div className="bg-white/95 rounded-2xl p-6 border border-[#1f7a8c]/20 shadow-xl">
            <div className="space-y-4">
              <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
              <div className="bg-gray-200 h-10 rounded"></div>
              <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
              <div className="bg-gray-200 h-24 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/cases/${caseId}`)}
              className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Case
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#022b3a]">Update Case</h1>
              <p className="text-[#022b3a]/70">Update case information and manage evidence</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h2 className="text-xl font-bold text-[#022b3a] mb-6">Case Information</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-[#022b3a] font-medium">
                  Case Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter case title"
                  required
                  className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#022b3a] font-medium">
                  Description *
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the case"
                  required
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-[#022b3a] font-medium">
                    Category *
                  </Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                  >
                    <option value="">Select a category</option>
                    <option value="Theft">Theft</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Assault">Assault</option>
                    <option value="Homicide">Homicide</option>
                    <option value="Cybercrime">Cybercrime</option>
                    <option value="Drug Offense">Drug Offense</option>
                    <option value="Vandalism">Vandalism</option>
                    <option value="Domestic Violence">Domestic Violence</option>
                    <option value="Burglary">Burglary</option>
                    <option value="Traffic Violation">Traffic Violation</option>
                    <option value="Other">Other</option>
                  </select>
                  
                  {formData.category === "Other" && (
                    <Input
                      id="customCategory"
                      name="customCategory"
                      value={formData.customCategory || ''}
                      onChange={handleInputChange}
                      placeholder="Enter custom category"
                      className="mt-2 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="location" className="text-[#022b3a] font-medium">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    required
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="priority" className="text-[#022b3a] font-medium">
                    Priority *
                  </Label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-[#022b3a] font-medium">
                    Status *
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="CLOSED">Closed</option>
                    <option value="COLD_CASE">Cold Case</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Evidence Section */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#022b3a]">Evidence ({formData.evidence.length})</h2>
              <Button 
                type="button"
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Evidence
              </Button>
            </div>

            {formData.evidence.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-[#1f7a8c]/30 rounded-lg">
                <Upload className="h-12 w-12 text-[#1f7a8c]/30 mx-auto mb-4" />
                <p className="text-[#022b3a]/60 mb-4">No evidence files yet</p>
                <Button 
                  type="button"
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Evidence
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.evidence.map((evidence) => (
                  <div key={evidence.id} className="border border-[#1f7a8c]/20 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#022b3a] mb-2">{evidence.filename}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#022b3a]/70">
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
                          <p className="text-sm text-[#022b3a]/80 mt-2">{evidence.notes}</p>
                        )}
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
          {/* Actions */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#022b3a] mb-4">Actions</h3>
            <div className="space-y-3">
              <Button 
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] hover:from-[#022b3a] hover:to-[#1f7a8c] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Updating...' : 'Update Case'}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/cases/${caseId}`)}
                className="w-full border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
              >
                Cancel
              </Button>
            </div>
          </Card>

          {/* Case Summary */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#022b3a] mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#022b3a]/70">Evidence Items</span>
                <span className="font-semibold text-[#022b3a]">{formData.evidence.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#022b3a]/70">Priority</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  formData.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                  formData.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                  formData.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {formData.priority}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#022b3a]/70">Status</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  formData.status === 'OPEN' ? 'bg-blue-100 text-blue-600' :
                  formData.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-600' :
                  formData.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-600' :
                  formData.status === 'CLOSED' ? 'bg-green-100 text-green-600' :
                  formData.status === 'COLD_CASE' ? 'bg-gray-100 text-gray-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {formData.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </form>

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
                <X className="h-4 w-4" />
              </Button>
            </div>
            <UploadForm 
              caseId={caseId}
              onSuccess={handleEvidenceUploaded}
              onError={(error) => {
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