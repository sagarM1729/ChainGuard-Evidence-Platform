"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Save, Plus, X, Upload, FileText, Calendar, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import ComprehensiveUploadForm from "@/components/evidence/ComprehensiveUploadForm"

interface Evidence {
  id: string
  filename: string
  filetype: string
  filesize: number
  notes: string
  evidenceType: 'DOCUMENT' | 'PHOTO' | 'VIDEO' | 'AUDIO' | 'PHYSICAL' | 'DIGITAL'
  category: string
  customCategory?: string
  tags: string[]
  collectedAt: string
  collectedTime?: string
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
  incidentDate: string
  incidentTime: string
  reportedDate: string
  reportedTime: string
  evidence: Evidence[]
}

export default function NewCasePage() {
  const router = useRouter()
  const { data: session } = useSession()
  
  const [formData, setFormData] = useState<CaseFormData>({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    location: '',
    priority: 'MEDIUM',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().slice(0, 5),
    reportedDate: new Date().toISOString().split('T')[0],
    reportedTime: new Date().toTimeString().slice(0, 5),
    evidence: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [currentEvidence, setCurrentEvidence] = useState<Evidence>({
    id: '',
    filename: '',
    filetype: '',
    filesize: 0,
    notes: '',
    evidenceType: 'PHYSICAL',
    category: '',
    customCategory: '',
    tags: [],
    collectedAt: new Date().toISOString().split('T')[0],
    collectedTime: new Date().toTimeString().slice(0, 5),
    collectedBy: session?.user?.name || '',
    location: ''
  })
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddEvidence = () => {
    setCurrentEvidence({
      id: Date.now().toString(),
      filename: '',
      filetype: '',
      filesize: 0,
      notes: '',
      evidenceType: 'PHYSICAL',
      category: '',
      customCategory: '',
      tags: [],
      collectedAt: new Date().toISOString().split('T')[0],
      collectedTime: new Date().toTimeString().slice(0, 5),
      collectedBy: session?.user?.name || '',
      location: ''
    })
    setShowEvidenceForm(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCurrentEvidence(prev => ({
        ...prev,
        filename: file.name,
        filetype: file.type,
        filesize: file.size,
        file: file
      }))
    }
  }

  const uploadToPinata = async (file: File): Promise<{ cid: string, url: string }> => {
    try {
      console.log('Starting server-side Pinata upload for:', file.name, 'Size:', file.size)

      // Use server-side API endpoint for Pinata upload
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Upload failed: ${response.status}`)
      }

      console.log('Server-side Pinata upload completed:', result)

      if (result.fallback) {
        console.warn('Using fallback storage due to:', result.error)
      }

      return {
        cid: result.result.cid,
        url: result.result.url
      }
    } catch (error) {
      console.error('Storage upload failed:', error)
      const fallbackCid = `local_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`
      console.warn('Using client-side fallback CID:', fallbackCid)
      return {
        cid: fallbackCid,
        url: `local://evidence/${fallbackCid}`
      }
    }
  }

  const handleSaveEvidence = async () => {
    if (!currentEvidence.filename || !currentEvidence.file) {
      alert('Please select a file')
      return
    }

    try {
      setUploadProgress(prev => ({ ...prev, [currentEvidence.id]: 0 }))
      
  const { cid, url } = await uploadToPinata(currentEvidence.file)
      setUploadProgress(prev => ({ ...prev, [currentEvidence.id]: 100 }))
      
      const newEvidence: Evidence = {
        ...currentEvidence,
        category: currentEvidence.category === "Other" ? currentEvidence.customCategory || "Other" : currentEvidence.category,
        tags: currentEvidence.tags.filter(tag => tag.trim() !== ''),
        ipfsCid: cid,
        retrievalUrl: url
      }
      
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, newEvidence]
      }))
      
      setShowEvidenceForm(false)
      setCurrentEvidence({
        id: '',
        filename: '',
        filetype: '',
        filesize: 0,
        notes: '',
        evidenceType: 'PHYSICAL',
        category: '',
        customCategory: '',
        tags: [],
        collectedAt: new Date().toISOString().split('T')[0],
        collectedTime: new Date().toTimeString().slice(0, 5),
        collectedBy: session?.user?.name || '',
        location: ''
      })
    } catch (error) {
      console.error('Error saving evidence:', error)
      alert('Failed to upload evidence. Please try again.')
    }
  }

  const handleRemoveEvidence = (evidenceId: string) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter(e => e.id !== evidenceId)
    }))
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    setCurrentEvidence(prev => ({ ...prev, tags }))
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const caseResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category === "Other" ? formData.customCategory : formData.category,
          location: formData.location,
          priority: formData.priority,
          incidentDate: formData.incidentDate,
          incidentTime: formData.incidentTime,
          reportedDate: formData.reportedDate,
          reportedTime: formData.reportedTime
        }),
      })
      
      if (!caseResponse.ok) {
        throw new Error('Failed to create case')
      }
      
      const { case: newCase } = await caseResponse.json()
      
      // Upload evidence for the case
      if (formData.evidence.length > 0) {
        for (const evidence of formData.evidence) {
          await fetch('/api/evidence', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...evidence,
              caseId: newCase.id
            }),
          })
        }
      }
      
      alert('Case created successfully!')
      router.push('/dashboard/cases')
    } catch (error) {
      console.error('Error creating case:', error)
      alert('Failed to create case. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-[#022b3a]">Create New Case</h1>
              <p className="text-[#022b3a]/70">Start a new investigation and organize evidence</p>
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
                  placeholder="Enter a descriptive case title"
                  required
                  className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#022b3a] font-medium">
                  Case Description *
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the case..."
                  required
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-[#022b3a] font-medium">
                    Case Category
                  </Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
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
                    Case Location / Address of Incident
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Sector 17, Navi Mumbai"
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="priority" className="text-[#022b3a] font-medium">
                  Priority Level
                </Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Priority</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Incident Details */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h2 className="text-xl font-bold text-[#022b3a] mb-6">Incident Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="incidentDate" className="text-[#022b3a] font-medium">
                    Date of Incident
                  </Label>
                  <Input
                    id="incidentDate"
                    name="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                </div>

                <div>
                  <Label htmlFor="incidentTime" className="text-[#022b3a] font-medium">
                    Time of Incident
                  </Label>
                  <Input
                    id="incidentTime"
                    name="incidentTime"
                    type="time"
                    value={formData.incidentTime}
                    onChange={handleInputChange}
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reportedDate" className="text-[#022b3a] font-medium">
                    Date Reported
                  </Label>
                  <Input
                    id="reportedDate"
                    name="reportedDate"
                    type="date"
                    value={formData.reportedDate}
                    onChange={handleInputChange}
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                </div>

                <div>
                  <Label htmlFor="reportedTime" className="text-[#022b3a] font-medium">
                    Time Reported
                  </Label>
                  <Input
                    id="reportedTime"
                    name="reportedTime"
                    type="time"
                    value={formData.reportedTime}
                    onChange={handleInputChange}
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
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
                onClick={handleAddEvidence}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Evidence
              </Button>
            </div>

            {formData.evidence.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-[#1f7a8c]/30 rounded-lg bg-[#1f7a8c]/5">
                <Upload className="h-12 w-12 text-[#1f7a8c]/40 mx-auto mb-4" />
                <p className="text-[#022b3a]/60 mb-4">No evidence files yet</p>
                <p className="text-sm text-[#022b3a]/50 mb-4">Add evidence files to strengthen your case</p>
                <Button 
                  type="button"
                  onClick={handleAddEvidence}
                  className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Evidence
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.evidence.map((evidence) => (
                  <div key={evidence.id} className="border border-[#1f7a8c]/20 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-5 w-5 text-[#1f7a8c]" />
                          <h3 className="font-semibold text-[#022b3a]">{evidence.filename}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#022b3a]/70 mb-3">
                          <div>
                            <span className="font-medium">Type:</span> {evidence.evidenceType}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {evidence.category}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {formatBytes(evidence.filesize)}
                          </div>
                          <div>
                            <span className="font-medium">Collected:</span> {new Date(evidence.collectedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#022b3a]/70 mb-3">
                          <div>
                            <span className="font-medium">By:</span> {evidence.collectedBy}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {evidence.location || 'Not specified'}
                          </div>
                        </div>
                        
                        {evidence.notes && (
                          <p className="text-sm text-[#022b3a]/80 mb-3">{evidence.notes}</p>
                        )}
                        
                        {evidence.tags && evidence.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {evidence.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-[#1f7a8c]/10 text-[#1f7a8c] text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEvidence(evidence.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 ml-4"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] hover:from-[#022b3a] hover:to-[#1f7a8c] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating Case...' : 'Create Case'}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/cases')}
                className="w-full border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
              >
                Cancel
              </Button>
            </div>
          </Card>

          {/* Case Preview */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#022b3a] mb-4">Case Preview</h3>
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
                <span className="text-[#022b3a]/70">Created By</span>
                <span className="text-[#022b3a]">{session?.user?.name || 'Officer'}</span>
              </div>
            </div>
          </Card>

          {/* Help */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#022b3a] mb-4">Tips</h3>
            <ul className="text-sm text-[#022b3a]/80 space-y-2">
              <li>• Be specific and detailed in your case description</li>
              <li>• Upload evidence files immediately for secure storage</li>
              <li>• Use relevant tags for easy categorization</li>
              <li>• Set appropriate priority levels for proper handling</li>
            </ul>
          </Card>
        </div>
      </form>

      {/* Evidence Upload Modal - Comprehensive Form */}
      {showEvidenceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#022b3a]">📁 Add Evidence - Comprehensive Details</h2>
              <Button 
                variant="outline"
                onClick={() => setShowEvidenceForm(false)}
                className="border-[#1f7a8c] text-[#1f7a8c]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 p-4 rounded-lg border border-[#1f7a8c]/20">
                <Label className="text-[#022b3a] font-semibold text-lg flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Select Evidence File *
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="mt-2 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                />
                {currentEvidence.filename && (
                  <div className="bg-white p-3 rounded-lg mt-3 border border-[#1f7a8c]/20">
                    <p className="text-sm font-medium text-[#022b3a]">
                      📄 {currentEvidence.filename} ({formatBytes(currentEvidence.filesize)})
                    </p>
                    <p className="text-xs text-[#022b3a]/70">Type: {currentEvidence.filetype}</p>
                  </div>
                )}
              </div>

              {/* Evidence Classification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <Label className="text-[#022b3a] font-semibold flex items-center h-6 mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    Evidence Type *
                  </Label>
                  <select
                    value={currentEvidence.evidenceType}
                    onChange={(e) => setCurrentEvidence(prev => ({ ...prev, evidenceType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                  >
                    <option value="PHYSICAL">🔧 Physical Evidence</option>
                    <option value="DIGITAL">💾 Digital Evidence</option>
                    <option value="DOCUMENT">📄 Document Evidence</option>
                    <option value="PHOTO">📸 Photographic Evidence</option>
                    <option value="VIDEO">🎥 Video Evidence</option>
                    <option value="AUDIO">🎵 Audio Evidence</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <Label className="text-[#022b3a] font-semibold flex items-center h-6 mb-2">
                    <span className="w-4 mr-2">📂</span>
                    Evidence Category *
                  </Label>
                  <select
                    value={currentEvidence.category}
                    onChange={(e) => setCurrentEvidence(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                  >
                    <option value="">Select category</option>
                    <option value="Weapon">🔫 Weapon</option>
                    <option value="Fingerprint">👆 Fingerprint</option>
                    <option value="DNA">🧬 DNA Sample</option>
                    <option value="CCTV Footage">📹 CCTV Footage</option>
                    <option value="Financial Record">💰 Financial Record</option>
                    <option value="Blood Sample">🩸 Blood Sample</option>
                    <option value="Document">📋 Document</option>
                    <option value="Phone Records">📱 Phone Records</option>
                    <option value="Computer Files">💻 Computer Files</option>
                    <option value="Clothing">👕 Clothing</option>
                    <option value="Vehicle">🚗 Vehicle</option>
                    <option value="Drug Sample">💊 Drug Sample</option>
                    <option value="Tool Mark">🔨 Tool Mark</option>
                    <option value="Other">❓ Other</option>
                  </select>
                  
                  {currentEvidence.category === "Other" && (
                    <Input
                      value={currentEvidence.customCategory || ''}
                      onChange={(e) => setCurrentEvidence(prev => ({ ...prev, customCategory: e.target.value }))}
                      placeholder="Enter custom evidence category"
                      className="mt-2 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                    />
                  )}
                </div>
              </div>

              {/* Collection Details */}
              <div className="bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 p-4 rounded-lg border border-[#1f7a8c]/20">
                <h3 className="font-semibold text-[#022b3a] mb-4 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Collection Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#022b3a] font-medium">Collection Date *</Label>
                    <Input
                      type="date"
                      value={currentEvidence.collectedAt}
                      onChange={(e) => setCurrentEvidence(prev => ({ ...prev, collectedAt: e.target.value }))}
                      className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                    />
                  </div>
                  <div>
                    <Label className="text-[#022b3a] font-medium">Collection Time</Label>
                    <Input
                      type="time"
                      value={currentEvidence.collectedTime || new Date().toTimeString().slice(0, 5)}
                      onChange={(e) => setCurrentEvidence(prev => ({ ...prev, collectedTime: e.target.value }))}
                      className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-[#022b3a] font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Collected By *
                  </Label>
                  <Input
                    value={currentEvidence.collectedBy}
                    onChange={(e) => setCurrentEvidence(prev => ({ ...prev, collectedBy: e.target.value }))}
                    placeholder="Officer name"
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                </div>

                <div className="mt-4">
                  <Label className="text-[#022b3a] font-medium">Collection Location *</Label>
                  <Input
                    value={currentEvidence.location}
                    onChange={(e) => setCurrentEvidence(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Specific location where evidence was found (e.g., Kitchen counter, next to the sink)"
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label className="text-[#022b3a] font-medium">Tags (comma-separated)</Label>
                  <Input
                    value={currentEvidence.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="e.g., weapon, fingerprint, digital, blood-spatter, witness-statement"
                    className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                  />
                  <p className="text-xs text-[#022b3a]/70 mt-1">Tags help with evidence categorization and search</p>
                </div>

                <div>
                  <Label className="text-[#022b3a] font-medium">Evidence Notes & Chain of Custody</Label>
                  <textarea
                    value={currentEvidence.notes}
                    onChange={(e) => setCurrentEvidence(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add detailed notes about this evidence: condition when found, witness statements, preservation method, chain of custody details, etc."
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-1 focus:ring-[#1f7a8c]/20 bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-[#1f7a8c]/20">
                <Button 
                  variant="outline"
                  onClick={() => setShowEvidenceForm(false)}
                  className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEvidence}
                  disabled={!currentEvidence.filename || !currentEvidence.category || !currentEvidence.location || !currentEvidence.collectedBy}
                  className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Evidence to Case
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
