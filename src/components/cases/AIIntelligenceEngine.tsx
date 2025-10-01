"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

interface KeyEntities {
  people: string[]
  locations: string[]
  organizations: string[]
  objects: string[]
}

interface LikelySuspect {
  profile: string
  reasoning: string
  evidenceSupporting: string[]
}

interface SuspectProfile {
  likelySuspects: LikelySuspect[]
  motivePrediction: string
  modusPrediction: string
}

interface NextStep {
  step: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  reasoning: string
}

interface CaseSummary {
  summary: string[]
  keyEntities: KeyEntities
  suspectProfile: SuspectProfile
  suggestedNextSteps: NextStep[]
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
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
            Analyze case details and evidence using AI to predict suspects, identify patterns, and provide prioritized investigative recommendations.
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
              <p className="text-xs text-[#022b3a]/60">Processing evidence patterns...</p>
              <p className="text-xs text-[#022b3a]/60">Generating suspect predictions...</p>
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
          {/* Analysis Content */}
          <div className="max-h-[600px] overflow-y-auto">
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

                {/* Suspect Profile */}
                {analysis.caseSummary.suspectProfile && (
                  <div>
                    <h4 className="font-semibold text-[#022b3a] mb-3 flex items-center">
                      <span className="text-lg mr-2">🔎</span>
                      Suspect Profile & Predictions
                    </h4>
                    <div className="space-y-4">
                      {/* Likely Suspects */}
                      {analysis.caseSummary.suspectProfile.likelySuspects && analysis.caseSummary.suspectProfile.likelySuspects.length > 0 && (
                        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                          <h5 className="font-medium text-orange-900 mb-3 flex items-center">
                            <span className="mr-2">👤</span>
                            Likely Suspects
                          </h5>
                          <div className="space-y-3">
                            {analysis.caseSummary.suspectProfile.likelySuspects.map((suspect, idx) => (
                              <div key={idx} className="border border-orange-300 rounded-lg p-3 bg-white">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="font-semibold text-[#022b3a]">{suspect.profile}</p>
                                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                                    Suspect #{idx + 1}
                                  </span>
                                </div>
                                <p className="text-sm text-[#022b3a]/80 mb-2">
                                  <span className="font-medium">Reasoning:</span> {suspect.reasoning}
                                </p>
                                {suspect.evidenceSupporting && suspect.evidenceSupporting.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-[#022b3a] mb-1">Supporting Evidence:</p>
                                    <ul className="space-y-1">
                                      {suspect.evidenceSupporting.map((evidence, eidx) => (
                                        <li key={eidx} className="text-xs text-[#022b3a]/70 flex items-start">
                                          <span className="text-orange-600 mr-1">•</span>
                                          {evidence}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Motive Prediction */}
                      {analysis.caseSummary.suspectProfile.motivePrediction && (
                        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                          <h5 className="font-medium text-purple-900 mb-2 flex items-center">
                            <span className="mr-2">💭</span>
                            Predicted Motive
                          </h5>
                          <p className="text-sm text-purple-900/90">
                            {analysis.caseSummary.suspectProfile.motivePrediction}
                          </p>
                        </div>
                      )}

                      {/* Modus Operandi Prediction */}
                      {analysis.caseSummary.suspectProfile.modusPrediction && (
                        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                            <span className="mr-2">🎯</span>
                            Predicted Modus Operandi
                          </h5>
                          <p className="text-sm text-blue-900/90">
                            {analysis.caseSummary.suspectProfile.modusPrediction}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggested Next Steps */}
                <div>
                  <h4 className="font-semibold text-[#022b3a] mb-3 flex items-center">
                    <span className="text-lg mr-2">✅</span>
                    Suggested Next Steps
                  </h4>
                  <div className="space-y-3">
                    {analysis.caseSummary.suggestedNextSteps.map((nextStep, idx) => {
                      const priorityColors = {
                        HIGH: 'bg-red-100 text-red-800 border-red-300',
                        MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                        LOW: 'bg-green-100 text-green-800 border-green-300'
                      }
                      const priorityColor = priorityColors[nextStep.priority] || priorityColors.MEDIUM

                      return (
                        <div key={idx} className={`border rounded-lg p-3 ${priorityColor}`}>
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm flex-1">{nextStep.step}</p>
                            <span className="text-xs px-2 py-1 bg-white/60 rounded-full ml-2 flex-shrink-0">
                              {nextStep.priority}
                            </span>
                          </div>
                          <p className="text-xs opacity-90">{nextStep.reasoning}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
            </div>
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
