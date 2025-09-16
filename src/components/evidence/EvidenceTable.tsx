"use client"

import { useState } from "react"
import { 
  File, 
  Download, 
  Shield, 
  Hash, 
  Link, 
  Calendar, 
  User,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Evidence {
  id: string
  filename: string
  filetype: string
  filesize: number
  notes?: string
  ipfsCid: string
  fileHash: string
  retrievalUrl: string
  blockchainTxId?: string
  custodyChain: Array<{
    officer: string
    timestamp: string
    action: string
    notes?: string
  }>
  createdAt: string
  case: {
    id: string
    title: string
  }
}

interface EvidenceTableProps {
  evidence: Evidence[]
  onVerify?: (evidenceId: string) => void
  onDelete?: (evidenceId: string) => void
}

export default function EvidenceTable({ evidence, onVerify, onDelete }: EvidenceTableProps) {
  const [verifying, setVerifying] = useState<string | null>(null)
  const [verificationResults, setVerificationResults] = useState<{[key: string]: boolean}>({})

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const handleVerify = async (evidenceId: string) => {
    setVerifying(evidenceId)
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/verify`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setVerificationResults(prev => ({
          ...prev,
          [evidenceId]: data.verification.isValid
        }))
        
        if (onVerify) {
          onVerify(evidenceId)
        }
      } else {
        console.error('Verification failed:', data.error)
      }
    } catch (error) {
      console.error('Verification error:', error)
    } finally {
      setVerifying(null)
    }
  }

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('Are you sure you want to delete this evidence record? The file will remain on IPFS for immutability.')) {
      return
    }

    try {
      const response = await fetch(`/api/evidence/${evidenceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (onDelete) {
          onDelete(evidenceId)
        }
      } else {
        const data = await response.json()
        console.error('Delete failed:', data.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (!evidence || evidence.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <File className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Evidence Found</h3>
        <p className="text-gray-600">Upload evidence files to see them listed here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Evidence Files</h2>
        <p className="text-sm text-gray-600">Secure IPFS storage with blockchain verification</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IPFS Storage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chain of Custody
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evidence.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {/* File Details */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 bg-[#1f7a8c] rounded-lg flex items-center justify-center">
                        <File className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.filename}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(item.filesize)} • {item.filetype}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-600 mt-1">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* IPFS Storage */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <Hash className="w-3 h-3 mr-1" />
                      <span className="font-mono">
                        {item.ipfsCid.substring(0, 12)}...
                      </span>
                    </div>
                    <a
                      href={item.retrievalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-[#1f7a8c] hover:text-[#022b3a]"
                    >
                      <Link className="w-3 h-3 mr-1" />
                      View on IPFS
                    </a>
                    {item.blockchainTxId && (
                      <div className="flex items-center text-xs text-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        <span>Blockchain Verified</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Verification */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {verificationResults[item.id] !== undefined ? (
                      <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                        verificationResults[item.id] 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {verificationResults[item.id] ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {verificationResults[item.id] ? 'Verified' : 'Failed'}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleVerify(item.id)}
                        disabled={verifying === item.id}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        {verifying === item.id ? (
                          <>
                            <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin mr-1" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Verify
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </td>

                {/* Chain of Custody */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="w-3 h-3 mr-1" />
                      <span>{item.custodyChain[0]?.officer || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    {item.custodyChain.length > 1 && (
                      <div className="text-xs text-gray-600">
                        +{item.custodyChain.length - 1} transfers
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => window.open(item.retrievalUrl, '_blank')}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
