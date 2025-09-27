'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  location: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  evidence: Evidence[]
}

export default function CreateCaseForm({ onClose, onCaseCreated }: { onClose?: () => void, onCaseCreated?: () => void }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<CaseFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'MEDIUM',
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
    evidenceType: 'DOCUMENT',
    category: '',
    tags: [],
    collectedAt: new Date().toISOString().split('T')[0],
    collectedBy: '',
    location: ''
  })
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])
  
  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }
  
  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to create a case.</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const handleAddEvidence = () => {
    setCurrentEvidence({
      id: Date.now().toString(),
      filename: '',
      filetype: '',
      filesize: 0,
      notes: '',
      evidenceType: 'DOCUMENT',
      category: '',
      tags: [],
      collectedAt: new Date().toISOString().split('T')[0],
      collectedBy: '',
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
      // Don't throw error, let the form continue with local reference
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
      
  // Upload to Pinata/IPFS
  const { cid, url } = await uploadToPinata(currentEvidence.file)
      setUploadProgress(prev => ({ ...prev, [currentEvidence.id]: 100 }))
      
      const newEvidence: Evidence = {
        ...currentEvidence,
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
        evidenceType: 'DOCUMENT',
        category: '',
        tags: [],
        collectedAt: new Date().toISOString().split('T')[0],
        collectedBy: '',
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

  const handleViewEvidence = (evidence: Evidence) => {
    if (evidence.retrievalUrl) {
      window.open(evidence.retrievalUrl, '_blank')
    }
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    setCurrentEvidence(prev => ({ ...prev, tags }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // First create the case
      const caseResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          priority: formData.priority
        }),
      })
      
      if (!caseResponse.ok) {
        throw new Error('Failed to create case')
      }
      
      const { case: newCase } = await caseResponse.json()
      
      // Then upload evidence for the case
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
      onCaseCreated?.()
      onClose?.()
    } catch (error) {
      console.error('Error creating case:', error)
      alert('Failed to create case. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Case</h2>
          <Button variant="outline" onClick={onClose}>×</Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Case Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter case title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Theft, Fraud, Assault"
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Case location"
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Case Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed case description"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Evidence Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Evidence ({formData.evidence.length})</h3>
              <Button type="button" onClick={handleAddEvidence}>
                📎 Add Evidence
              </Button>
            </div>
            
            {/* Evidence List */}
            {formData.evidence.length > 0 && (
              <div className="space-y-2">
                {formData.evidence.map((evidence) => (
                  <div key={evidence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">{evidence.filename}</span>
                        <span className="text-sm text-gray-500">{evidence.evidenceType}</span>
                        <span className="text-sm text-gray-500">
                          {(evidence.filesize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      {evidence.notes && (
                        <p className="text-sm text-gray-600 mt-1">{evidence.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEvidence(evidence)}
                        disabled={!evidence.retrievalUrl}
                      >
                        👁️ View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEvidence(evidence.id)}
                      >
                        �️ Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Evidence Upload Form */}
            {showEvidenceForm && (
              <Card className="p-4 bg-blue-50">
                <h4 className="text-lg font-medium mb-4">Add Evidence</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label>Select File *</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3,.txt"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="evidenceType">Evidence Type</Label>
                      <select
                        id="evidenceType"
                        value={currentEvidence.evidenceType}
                        onChange={(e) => setCurrentEvidence(prev => ({ ...prev, evidenceType: e.target.value as any }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="DOCUMENT">Document</option>
                        <option value="PHOTO">Photo</option>
                        <option value="VIDEO">Video</option>
                        <option value="AUDIO">Audio</option>
                        <option value="PHYSICAL">Physical</option>
                        <option value="DIGITAL">Digital</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="evidenceCategory">Category</Label>
                      <Input
                        id="evidenceCategory"
                        value={currentEvidence.category}
                        onChange={(e) => setCurrentEvidence(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Evidence category"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="collectedAt">Collection Date</Label>
                      <Input
                        id="collectedAt"
                        type="date"
                        value={currentEvidence.collectedAt}
                        onChange={(e) => setCurrentEvidence(prev => ({ ...prev, collectedAt: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="collectedBy">Collected By</Label>
                      <Input
                        id="collectedBy"
                        value={currentEvidence.collectedBy}
                        onChange={(e) => setCurrentEvidence(prev => ({ ...prev, collectedBy: e.target.value }))}
                        placeholder="Officer/Investigator name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="evidenceLocation">Collection Location</Label>
                      <Input
                        id="evidenceLocation"
                        value={currentEvidence.location}
                        onChange={(e) => setCurrentEvidence(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Where evidence was found"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={currentEvidence.tags.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="weapon, fingerprint, DNA, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="evidenceNotes">Notes</Label>
                    <textarea
                      id="evidenceNotes"
                      value={currentEvidence.notes}
                      onChange={(e) => setCurrentEvidence(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this evidence"
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {uploadProgress[currentEvidence.id] !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress[currentEvidence.id]}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button type="button" onClick={handleSaveEvidence}>
                      💾 Save Evidence
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowEvidenceForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Case...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
