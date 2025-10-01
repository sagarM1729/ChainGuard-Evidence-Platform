"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Loader2, ChevronDown, ChevronUp, ExternalLink, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface KeyEntities {
  people: string[]
  locations: string[]
  organizations: string[]
  objects: string[]
}

interface CaseSummary {
  summary: string[]
  keyEntities: KeyEntities
  suggestedNextSteps: string[]
}

interface RelatedCase {
  caseNumber: string
  title: string
  reasonForFlagging: string
  caseId: string
}

interface ExternalContext {
  eventDescription: string
  source: string
  date: string
  relevance: string
}

interface AnalysisResult {
  caseSummary: CaseSummary
  relatedCases: RelatedCase[]
  externalContext: ExternalContext[]
}

interface AIIntelligenceEngineProps {
  caseId: string
}

export default function AIIntelligenceEngine({ caseId }: AIIntelligenceEngineProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'related' | 'external'>('summary')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    people: true,
    locations: true,
    organizations: true,
    objects: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('Starting AI analysis for case:', caseId)
      
      const response = await fetch(`/api/cases/${caseId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error:', errorData)
        throw new Error(errorData.error || `Failed to analyze case (${response.status})`)
      }

      const data = await response.json()
      console.log('Analysis received:', data)
      
      if (!data.analysis) {
        throw new Error('No analysis data received')
      }

      setAnalysis(data.analysis)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Failed to analyze case. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="p-6 border-[#1f7a8c]/20 bg-white/95 backdrop-blur-sm shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-lg">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-[#022b3a]">AI Intelligence Engine</h3>
      </div>

      {!analysis && !isAnalyzing && (
        <div className="space-y-4">
          <p className="text-sm text-[#022b3a]/70 leading-relaxed">
            Analyze case details, evidence, and cross-reference with internal and external data sources to uncover hidden patterns.
          </p>
          <Button
            onClick={handleRunAnalysis}
            className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] hover:from-[#022b3a] hover:to-[#1f7a8c] text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            Run Full Analysis
          </Button>
        </div>
      )}

      {isAnalyzing && (
        <div className="space-y-4 py-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-[#1f7a8c] animate-spin mb-4" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-[#022b3a]">Analyzing case data...</p>
              <p className="text-xs text-[#022b3a]/60">Cross-referencing cases...</p>
              <p className="text-xs text-[#022b3a]/60">Querying external sources...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Analysis Failed</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
            <Button
              onClick={handleRunAnalysis}
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-[#1f7a8c]/20">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'text-[#1f7a8c] border-b-2 border-[#1f7a8c]'
                  : 'text-[#022b3a]/60 hover:text-[#022b3a]'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('related')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'related'
                  ? 'text-[#1f7a8c] border-b-2 border-[#1f7a8c]'
                  : 'text-[#022b3a]/60 hover:text-[#022b3a]'
              }`}
            >
              Related Cases ({analysis.relatedCases.length})
            </button>
            <button
              onClick={() => setActiveTab('external')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'external'
                  ? 'text-[#1f7a8c] border-b-2 border-[#1f7a8c]'
                  : 'text-[#022b3a]/60 hover:text-[#022b3a]'
              }`}
            >
              External ({analysis.externalContext.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-[600px] overflow-y-auto">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* AI-Generated Summary */}
                <div>
                  <h4 className="font-semibold text-[#022b3a] mb-3 flex items-center">
                    <span className="text-lg mr-2">📋</span>
                    AI-Generated Summary
                  </h4>
                  <ul className="space-y-2">
                    {analysis.caseSummary.summary.map((point, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[#022b3a]/80">
                        <span className="text-[#1f7a8c] mr-2">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Entities */}
                <div>
                  <h4 className="font-semibold text-[#022b3a] mb-3 flex items-center">
                    <span className="text-lg mr-2">🔍</span>
                    Key Entities
                  </h4>
                  <div className="space-y-3">
                    {/* People */}
                    {analysis.caseSummary.keyEntities.people.length > 0 && (
                      <div className="border border-[#1f7a8c]/20 rounded-lg p-3">
                        <button
                          onClick={() => toggleSection('people')}
                          className="flex items-center justify-between w-full text-sm font-medium text-[#022b3a] hover:text-[#1f7a8c]"
                        >
                          <span>👥 People ({analysis.caseSummary.keyEntities.people.length})</span>
                          {expandedSections.people ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedSections.people && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {analysis.caseSummary.keyEntities.people.map((person, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {person}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Locations */}
                    {analysis.caseSummary.keyEntities.locations.length > 0 && (
                      <div className="border border-[#1f7a8c]/20 rounded-lg p-3">
                        <button
                          onClick={() => toggleSection('locations')}
                          className="flex items-center justify-between w-full text-sm font-medium text-[#022b3a] hover:text-[#1f7a8c]"
                        >
                          <span>📍 Locations ({analysis.caseSummary.keyEntities.locations.length})</span>
                          {expandedSections.locations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedSections.locations && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {analysis.caseSummary.keyEntities.locations.map((location, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                {location}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Organizations */}
                    {analysis.caseSummary.keyEntities.organizations.length > 0 && (
                      <div className="border border-[#1f7a8c]/20 rounded-lg p-3">
                        <button
                          onClick={() => toggleSection('organizations')}
                          className="flex items-center justify-between w-full text-sm font-medium text-[#022b3a] hover:text-[#1f7a8c]"
                        >
                          <span>🏢 Organizations ({analysis.caseSummary.keyEntities.organizations.length})</span>
                          {expandedSections.organizations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedSections.organizations && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {analysis.caseSummary.keyEntities.organizations.map((org, idx) => (
                              <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                                {org}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Objects */}
                    {analysis.caseSummary.keyEntities.objects.length > 0 && (
                      <div className="border border-[#1f7a8c]/20 rounded-lg p-3">
                        <button
                          onClick={() => toggleSection('objects')}
                          className="flex items-center justify-between w-full text-sm font-medium text-[#022b3a] hover:text-[#1f7a8c]"
                        >
                          <span>📦 Objects ({analysis.caseSummary.keyEntities.objects.length})</span>
                          {expandedSections.objects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedSections.objects && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {analysis.caseSummary.keyEntities.objects.map((object, idx) => (
                              <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                                {object}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggested Next Steps */}
                <div>
                  <h4 className="font-semibold text-[#022b3a] mb-3 flex items-center">
                    <span className="text-lg mr-2">✅</span>
                    Suggested Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {analysis.caseSummary.suggestedNextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[#022b3a]/80">
                        <span className="text-[#1f7a8c] mr-2 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'related' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-[#022b3a] mb-3">Potential Links to Other Cases</h4>
                {analysis.relatedCases.length === 0 ? (
                  <p className="text-sm text-[#022b3a]/60 text-center py-8">
                    No related cases found. This case appears to be unique.
                  </p>
                ) : (
                  analysis.relatedCases.map((relatedCase, idx) => (
                    <div
                      key={idx}
                      className="border border-[#1f7a8c]/20 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-[#1f7a8c]/5 to-transparent"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-[#022b3a]">{relatedCase.caseNumber}</h5>
                          <p className="text-sm text-[#022b3a]/80 mt-1">{relatedCase.title}</p>
                        </div>
                        <Button
                          onClick={() => router.push(`/dashboard/cases/${relatedCase.caseId}`)}
                          variant="outline"
                          size="sm"
                          className="border-[#1f7a8c]/30 text-[#1f7a8c] hover:bg-[#1f7a8c]/10"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs font-medium text-yellow-900 mb-1">Reason for Flagging:</p>
                        <p className="text-xs text-yellow-800">{relatedCase.reasonForFlagging}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'external' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-[#022b3a] mb-3">External Intelligence & Public Records</h4>
                {analysis.externalContext.length === 0 ? (
                  <p className="text-sm text-[#022b3a]/60 text-center py-8">
                    No external context available at this time.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analysis.externalContext.map((context, idx) => (
                      <div
                        key={idx}
                        className="border border-[#1f7a8c]/20 rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-[#022b3a] text-sm flex-1">
                            {context.eventDescription}
                          </h5>
                        </div>
                        <div className="space-y-1 text-xs text-[#022b3a]/70">
                          <p className="flex items-center">
                            <span className="font-medium mr-2">Source:</span>
                            <span>{context.source}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2">Date:</span>
                            <span>{context.date}</span>
                          </p>
                        </div>
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs font-medium text-blue-900 mb-1">Relevance:</p>
                          <p className="text-xs text-blue-800">{context.relevance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Re-analyze Button */}
          <div className="pt-4 border-t border-[#1f7a8c]/20">
            <Button
              onClick={handleRunAnalysis}
              variant="outline"
              size="sm"
              className="w-full border-[#1f7a8c]/30 text-[#1f7a8c] hover:bg-[#1f7a8c]/10"
            >
              <Brain className="h-3 w-3 mr-2" />
              Re-analyze
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
