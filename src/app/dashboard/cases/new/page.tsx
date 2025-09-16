"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, FileText } from "lucide-react"

export default function NewCasePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "open"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create case")
        return
      }

      // Redirect to the cases list or the new case detail page
      router.push("/dashboard/cases")
    } catch (error) {
      console.error("Error creating case:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/cases"
            className="inline-flex items-center text-[#1f7a8c] hover:text-[#022b3a] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-[#1f7a8c] rounded-lg mr-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Case</h1>
          </div>
          <p className="text-gray-600">
            Start a new evidence case to organize and manage your investigation
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Case Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Case Title *
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for your case"
                className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent"
              />
            </div>

            {/* Case Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description *
              </Label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of the case"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent resize-vertical"
              />
            </div>

            {/* Case Status */}
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Initial Status
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/dashboard/cases">
                <Button
                  type="button"
                  variant="outline"
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#1f7a8c] hover:bg-[#022b3a] text-white px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Creating..." : "Create Case"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
