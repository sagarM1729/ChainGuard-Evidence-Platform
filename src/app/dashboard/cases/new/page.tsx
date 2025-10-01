"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Save, FileText, Calendar, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

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
    reportedTime: new Date().toTimeString().slice(0, 5)
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      
      alert('Case created successfully! You can now add evidence to this case.')
      router.push(`/dashboard/cases/${newCase.id}`)
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
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="description" className="text-[#022b3a] font-medium">
                    Case Description *
                  </Label>
                  <span className="text-xs text-[#022b3a]/60">
                    {formData.description.length} characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the case..."
                    required
                    rows={6}
                    className="mt-1 w-full px-4 py-3 border border-[#1f7a8c]/20 rounded-lg focus:border-[#1f7a8c] focus:ring-2 focus:ring-[#1f7a8c]/20 bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 transition-all duration-200 resize-y min-h-[150px]"
                  />
                </div>
                <p className="mt-1 text-xs text-[#022b3a]/60 flex items-start">
                  <span className="mr-1">💡</span>
                  <span>Be detailed and specific. This description will be part of the official case record.</span>
                </p>
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

          {/* Info Card about Evidence */}
          <Card className="p-6 border-[#1f7a8c]/20 bg-gradient-to-r from-[#1f7a8c]/5 to-[#022b3a]/5 backdrop-blur-sm shadow-xl">
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-[#1f7a8c] mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-[#022b3a] mb-2">Add Evidence Later</h3>
                <p className="text-sm text-[#022b3a]/70 leading-relaxed">
                  Create the case first, then you&apos;ll be redirected to the case details page where you can securely upload and manage all evidence files.
                </p>
              </div>
            </div>
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
                <span className="text-[#022b3a]/70">Category</span>
                <span className="font-semibold text-[#022b3a]">{formData.category || 'Not selected'}</span>
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
              <li>• Set appropriate priority levels for proper handling</li>
              <li>• Use relevant categories for easy organization</li>
              <li>• Evidence files can be added after case creation</li>
            </ul>
          </Card>
        </div>
      </form>
    </div>
  )
}
