
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, ShieldAlert, Upload, XCircle } from "lucide-react"

interface TamperDetectorProps {
  evidenceId: string
  evidenceFilename: string
}

export default function TamperDetector({ evidenceId, evidenceFilename }: TamperDetectorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<{
    verified: boolean
    isContentVerified?: boolean
    isChainVerified?: boolean
    statusMessage?: string
    storedHash: string
    currentHash: string
    timestamp: string
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null) // Reset previous result
    }
  }

  const handleVerify = async () => {
    if (!file) return

    setVerifying(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('evidenceId', evidenceId)

      const response = await fetch('/api/evidence/verify', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Verification failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Verification error:", error)
      // Handle error state
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-blue-600" />
        Forensic Integrity Check
      </h3>
      
      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="tamper-file">Upload file to verify against "{evidenceFilename}"</Label>
          <Input 
            id="tamper-file" 
            type="file" 
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>

        <Button 
          onClick={handleVerify} 
          disabled={!file || verifying}
          className="w-full sm:w-auto"
        >
          {verifying ? "Verifying..." : "Verify Integrity"}
        </Button>

        {result && (
          <Card className={`p-4 border-2 ${result.verified ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-start gap-3">
              {result.verified ? (
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mt-1" />
              )}
              
              <div className="space-y-2 w-full">
                <h4 className={`font-bold text-lg ${result.verified ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {result.verified ? "INTEGRITY VERIFIED" : "TAMPER DETECTED"}
                </h4>
                
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {result.verified 
                    ? "The uploaded file matches the original evidence record exactly. No tampering detected."
                    : result.statusMessage || "CRITICAL WARNING: The uploaded file does NOT match the original evidence record. The content has been modified."
                  }
                </p>

                <div className="mt-3 p-3 bg-white dark:bg-slate-950 rounded border text-xs font-mono space-y-1 overflow-x-auto">
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-slate-500">Stored Hash:</span>
                    <span className="text-blue-600 break-all">{result.storedHash}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-slate-500">Upload Hash:</span>
                    <span className={`${result.isContentVerified ? 'text-green-600' : 'text-red-600'} break-all`}>
                      {result.currentHash}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4 mt-2 pt-2 border-t border-slate-100">
                     <span className="text-slate-500">Chain Status:</span>
                     <span className={`${result.isChainVerified !== false ? 'text-green-600' : 'text-red-600'} font-bold`}>
                        {result.isChainVerified !== false ? "MERKLE ROOT MATCHED" : "MERKLE ROOT MISMATCH (DB TAMPERED)"}
                     </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
