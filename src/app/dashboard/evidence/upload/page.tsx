"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Folder, FileText, ArrowRight, Upload } from "lucide-react"

export default function EvidenceUploadRedirectPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-[#1f7a8c]/20 shadow-xl">
            <Upload className="h-16 w-16 text-[#1f7a8c] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#022b3a] mb-4">Evidence Upload</h1>
            <p className="text-[#022b3a]/70 mb-6">
              Evidence is now uploaded directly when creating or updating cases for better organization and workflow.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Case */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div onClick={() => router.push('/dashboard/cases/new')}>
              <div className="text-center">
                <Plus className="h-12 w-12 text-[#1f7a8c] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#022b3a] mb-2">Create New Case</h2>
                <p className="text-[#022b3a]/70 mb-4">
                  Start a new investigation and upload evidence during case creation
                </p>
                <Button className="bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white w-full">
                  Create Case
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* View Existing Cases */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div onClick={() => router.push('/dashboard/cases')}>
              <div className="text-center">
                <Folder className="h-12 w-12 text-[#022b3a] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#022b3a] mb-2">Existing Cases</h2>
                <p className="text-[#022b3a]/70 mb-4">
                  View your cases and add evidence to ongoing investigations
                </p>
                <Button 
                  variant="outline" 
                  className="border border-[#022b3a]/30 bg-white text-[#022b3a] hover:bg-[#022b3a]/10 hover:border-[#022b3a]/40 hover:text-[#022b3a] active:scale-95 transition-colors duration-200 w-full"
                >
                  View Cases
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Information */}
        <div className="mt-8">
          <Card className="p-6 border-[#1f7a8c]/20 bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 backdrop-blur-sm shadow-xl">
            <div className="flex items-start space-x-4">
              <FileText className="h-6 w-6 text-[#1f7a8c] mt-1" />
              <div>
                <h3 className="font-semibold text-[#022b3a] mb-2">How Evidence Upload Works</h3>
                <ul className="text-[#022b3a]/80 space-y-1 text-sm">
                  <li>• <strong>During Case Creation:</strong> Upload evidence files as you create new cases</li>
                  <li>• <strong>Case Details Page:</strong> Click &quot;Add Evidence&quot; button to upload to existing cases</li>
                  <li>• <strong>Case Edit Page:</strong> Add evidence while updating case information</li>
                  <li>• <strong>Secure Storage:</strong> All evidence is stored on IPFS with blockchain verification</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
