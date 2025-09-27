"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MerkleProof } from "@/lib/merkle"
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Shield, 
  Hash,
  Link,
  Link as Chain
} from "lucide-react"

interface ComprehensiveUploadFormProps {
  caseId: string
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

interface UploadResult {
  ipfsCid: string
  retrievalUrl: string
  fileHash: string
  merkleRoot: string
  merkleProof: MerkleProof
}

export default function ComprehensiveUploadForm({ caseId, onSuccess, onError }: ComprehensiveUploadFormProps) {
  const { data: session } = useSession()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [evidenceType, setEvidenceType] = useState<'DOCUMENT' | 'PHOTO' | 'VIDEO' | 'AUDIO' | 'PHYSICAL' | 'DIGITAL'>('PHYSICAL')
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [collectedAt, setCollectedAt] = useState(new Date().toISOString().split('T')[0])
  const [collectedTime, setCollectedTime] = useState(new Date().toTimeString().slice(0, 5))
  const [collectedBy, setCollectedBy] = useState(session?.user?.name || '')
  const [location, setLocation] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError("")
      setUploadResult(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setError("")
      setUploadResult(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError("")
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleTagsChange = (tagsString: string) => {
    const newTags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    setTags(newTags)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('caseId', caseId)
      formData.append('notes', notes)
      formData.append('evidenceType', evidenceType)
      formData.append('category', category === "Other" ? customCategory || "Other" : category)
      formData.append('tags', JSON.stringify(tags.filter(tag => tag.trim() !== '')))
      formData.append('collectedAt', collectedAt)
      formData.append('collectedTime', collectedTime)
      formData.append('collectedBy', collectedBy)
      formData.append('location', location)

      console.log('📤 Uploading evidence to IPFS...', {
        filename: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        evidenceType,
        category: category === "Other" ? customCategory || "Other" : category,
        collectedBy,
        location
      })

      const response = await fetch('/api/evidence', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      console.log('✅ Evidence uploaded successfully:', data.evidence)
      
      setUploadResult(data.evidence)
      setSelectedFile(null)
      setNotes("")
      setEvidenceType('PHYSICAL')
      setCategory("")
      setCustomCategory("")
      setTags([])
      setCollectedAt(new Date().toISOString().split('T')[0])
      setCollectedTime(new Date().toTimeString().slice(0, 5))
      setCollectedBy(session?.user?.name || '')
      setLocation("")
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      if (onSuccess) {
        onSuccess(data.evidence)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      console.error('❌ Evidence upload failed:', error)
      setError(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-[#1f7a8c] rounded-lg mr-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Evidence</h2>
            <p className="text-sm text-gray-600">Secure IPFS storage with blockchain verification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedFile 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-[#1f7a8c] hover:bg-blue-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <File className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop files here</p>
                  <p className="text-sm text-gray-600">or click to browse</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-[#1f7a8c]/30 bg-white text-[#1f7a8c] hover:bg-[#1f7a8c]/10 hover:border-[#1f7a8c]/40 hover:text-[#1f7a8c] active:scale-95 transition-colors duration-200"
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />

          {/* Evidence Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="evidenceType" className="text-sm font-medium text-gray-700">
                Evidence Type
              </Label>
              <select
                id="evidenceType"
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent"
              >
                <option value="PHYSICAL">Physical</option>
                <option value="DOCUMENT">Document</option>
                <option value="PHOTO">Photo</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="DIGITAL">Digital</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Weapon">Weapon</option>
                <option value="Fingerprint">Fingerprint</option>
                <option value="DNA">DNA</option>
                <option value="Blood">Blood</option>
                <option value="Fiber">Fiber</option>
                <option value="Digital Media">Digital Media</option>
                <option value="Documents">Documents</option>
                <option value="Photos">Photos</option>
                <option value="Video">Video</option>
                <option value="Audio">Audio</option>
                <option value="Phone Records">Phone Records</option>
                <option value="Computer Files">Computer Files</option>
                <option value="Clothing">Clothing</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Other">Other</option>
              </select>
              
              {category === "Other" && (
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom evidence category"
                  className="mt-2 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
                />
              )}
            </div>
          </div>

          {/* Collection Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="collectedAt" className="text-sm font-medium text-gray-700">
                Collection Date
              </Label>
              <Input
                id="collectedAt"
                type="date"
                value={collectedAt}
                onChange={(e) => setCollectedAt(e.target.value)}
                className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
              />
            </div>
            <div>
              <Label htmlFor="collectedTime" className="text-sm font-medium text-gray-700">
                Collection Time
              </Label>
              <Input
                id="collectedTime"
                type="time"
                value={collectedTime}
                onChange={(e) => setCollectedTime(e.target.value)}
                className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
              />
            </div>
          </div>

          {/* Collected By */}
          <div>
            <Label htmlFor="collectedBy" className="text-sm font-medium text-gray-700">
              Collected By
            </Label>
            <Input
              id="collectedBy"
              value={collectedBy}
              onChange={(e) => setCollectedBy(e.target.value)}
              placeholder="Officer name"
              className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Collection Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="On the counter, next to the cash register"
              className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              value={tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="e.g., weapon, fingerprint, digital"
              className="mt-1 border-[#1f7a8c]/20 focus:border-[#1f7a8c] focus:ring-[#1f7a8c]/20"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes (Optional)
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes about this evidence..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent resize-vertical"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {uploadResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">Evidence Uploaded Successfully!</h3>
                  <p className="text-green-700 text-sm">Your evidence has been securely stored on IPFS with blockchain verification.</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">IPFS CID:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {uploadResult.ipfsCid}
                  </code>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Retrieval URL:</span>
                  <a 
                    href={uploadResult.retrievalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#1f7a8c] hover:text-[#022b3a] underline"
                  >
                    View on IPFS
                  </a>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">File Hash:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {uploadResult.fileHash.substring(0, 16)}...
                  </code>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Chain className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Merkle Root:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {uploadResult.merkleRoot}
                  </code>
                </div>

                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Merkle Proof:</span>
                  <span className="text-gray-600">
                    {uploadResult.merkleProof.siblings.length} sibling nodes
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="w-full bg-[#1f7a8c] hover:bg-[#022b3a] text-white py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading to IPFS...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Upload Evidence</span>
              </>
            )}
          </Button>
        </form>

        {/* Info Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-[#1f7a8c] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">IPFS Storage</p>
                <p>Immutable content addressing</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Hash className="w-4 h-4 text-[#1f7a8c] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">File Integrity</p>
                <p>SHA-256 hash verification</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Chain className="w-4 h-4 text-[#1f7a8c] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Merkle Ledger</p>
                <p>Case-level integrity root</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}