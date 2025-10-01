import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables!")
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface AnalysisResult {
  caseSummary: {
    summary: string[]
    keyEntities: {
      people: string[]
      locations: string[]
      organizations: string[]
      objects: string[]
    }
    suspectProfile: {
      likelySuspects: Array<{
        profile: string
        reasoning: string
        evidenceSupporting: string[]
      }>
      motivePrediction: string
      modusPrediction: string
    }
    suggestedNextSteps: Array<{
      step: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      reasoning: string
    }>
  }
  relatedCases: Array<{
    caseNumber: string
    title: string
    reasonForFlagging: string
    caseId: string
  }>
  externalContext: Array<{
    eventDescription: string
    source: string
    date: string
    relevance: string
  }>
}

// Function to analyze case with Gemini AI for suspect profiling and pattern detection
async function analyzeCaseWithGemini(caseData: any, allCases: any[]): Promise<AnalysisResult> {
  try {
    console.log("Starting Gemini analysis for case:", caseData.caseNumber)
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured")
    }

    console.log("Initializing Gemini model...")
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    })

    // Prepare case data for analysis
    const caseText = `
Case Details:
- Title: ${caseData.title}
- Case Number: ${caseData.caseNumber}
- Description: ${caseData.description}
- Category: ${caseData.category || 'Not specified'}
- Location: ${caseData.location || 'Not specified'}
- Status: ${caseData.status}
- Priority: ${caseData.priority}
- Created: ${new Date(caseData.createdAt).toLocaleDateString()}

Evidence Items (${caseData.evidence.length}):
${caseData.evidence.map((ev: any, idx: number) => `
${idx + 1}. ${ev.filename}
   - Type: ${ev.evidenceType}
   - Category: ${ev.category || 'Not specified'}
   - Collected: ${ev.collectedAt ? new Date(ev.collectedAt).toLocaleDateString() : 'Unknown'}
   - Collected By: ${ev.collectedBy || 'Unknown'}
   - Location: ${ev.location || 'Not specified'}
   - Notes: ${ev.notes || 'No notes'}
   - Tags: ${ev.tags?.join(', ') || 'No tags'}
`).join('\n')}

Other Cases in System:
${allCases.slice(0, 10).map((c: any, idx: number) => `
${idx + 1}. Case ${c.caseNumber}: ${c.title}
   - Category: ${c.category || 'Not specified'}
   - Location: ${c.location || 'Not specified'}
   - Description: ${c.description.substring(0, 200)}...
`).join('\n')}
`

    // Generate comprehensive analysis
    const prompt = `As an expert criminal investigation analyst, analyze the following case and provide a comprehensive analysis in JSON format.

${caseText}

IMPORTANT: Focus on evidence-based analysis using ONLY the case data, evidence files, and related cases provided above. Do not make assumptions about external sources or events.

Please provide your analysis in the following JSON structure:
{
  "caseSummary": {
    "summary": ["bullet point 1", "bullet point 2", ...],
    "keyEntities": {
      "people": ["person names mentioned"],
      "locations": ["specific locations"],
      "organizations": ["organizations mentioned"],
      "objects": ["weapons, vehicles, significant items"]
    },
    "suspectProfile": {
      "likelySuspects": [
        {
          "profile": "Description of suspect type/profile",
          "reasoning": "Detailed explanation of why this person/type might be involved based on evidence",
          "evidenceSupporting": ["evidence point 1", "evidence point 2", ...]
        }
      ],
      "motivePrediction": "Predicted motive based on evidence and patterns",
      "modusPrediction": "Predicted method of operation based on evidence"
    },
    "suggestedNextSteps": [
      {
        "step": "Specific actionable step",
        "priority": "HIGH/MEDIUM/LOW",
        "reasoning": "Why this step is important"
      }
    ]
  },
  "relatedCases": [
    {
      "caseNumber": "case number from the list",
      "title": "case title",
      "reasonForFlagging": "detailed explanation of similarity",
      "caseId": "case id"
    }
  ],
  "externalContext": []
}

ANALYSIS FOCUS (use ONLY provided case data and evidence):

1. SUSPECT PROFILING: Predict WHO might have committed this crime based on evidence
   - Physical evidence (DNA, fingerprints, weapons, traces)
   - Behavioral patterns (timing, method, target selection)
   - Geographic patterns (location familiarity, escape routes)
   - Comparison with similar cases in the provided database

2. MOTIVE ANALYSIS: WHY this crime was committed
   - Financial gain, revenge, passion, organized crime, etc.
   - Support each theory with specific evidence from the case

3. METHOD PREDICTION: HOW the crime was executed
   - Level of planning and sophistication (based on evidence)
   - Tools and techniques used (documented in evidence files)
   - Insider knowledge indicators

4. NEXT STEPS: Prioritized investigative actions
   - HIGH priority: Immediate actions (evidence preservation, urgent interviews)
   - MEDIUM priority: Important but can wait 24-48 hours
   - LOW priority: Background investigation and documentation

5. PATTERN DETECTION: Find similar cases ONLY from the related cases list above

CRITICAL: Base ALL analysis on provided evidence. Do NOT reference external sources or make assumptions. Set externalContext to empty array [].

Return ONLY valid JSON, no additional text.`

    console.log("Sending prompt to Gemini AI...")
    console.log("API Key present:", !!process.env.GEMINI_API_KEY)
    console.log("API Key starts with:", process.env.GEMINI_API_KEY?.substring(0, 10))
    
    const result = await model.generateContent(prompt)
    console.log("Result received:", !!result)
    
    const response = await result.response
    console.log("Response received:", !!response)
    
    const text = response.text()
    console.log("Received response from Gemini AI, length:", text.length)
    
    // Extract JSON from response (sometimes Gemini wraps it in markdown code blocks)
    let jsonText = text
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim()
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim()
    }

    console.log("Parsing JSON response...")
    const analysis: AnalysisResult = JSON.parse(jsonText)
    console.log("Analysis complete, found", analysis.relatedCases.length, "related cases")

    return analysis
  } catch (error: any) {
    console.error("Error analyzing with Gemini:", error)
    console.error("Error message:", error?.message)
    console.error("Error status:", error?.status)
    console.error("Error details:", JSON.stringify(error, null, 2))
    
    // Rethrow the error so we can see it in the API response
    throw new Error(`Gemini API Error: ${error?.message || 'Unknown error'}`)
    
    // Return a fallback analysis
    return {
      caseSummary: {
        summary: [
          "Case analysis is currently processing",
          `This is a ${caseData.priority} priority ${caseData.category || 'general'} case`,
          `${caseData.evidence.length} pieces of evidence have been collected`
        ],
        keyEntities: {
          people: [],
          locations: caseData.location ? [caseData.location] : [],
          organizations: [],
          objects: []
        },
        suspectProfile: {
          likelySuspects: [],
          motivePrediction: "Analysis in progress",
          modusPrediction: "Analysis in progress"
        },
        suggestedNextSteps: [
          {
            step: "Review all collected evidence thoroughly",
            priority: "HIGH",
            reasoning: "Complete evidence review is essential for accurate analysis"
          },
          {
            step: "Interview relevant witnesses",
            priority: "HIGH",
            reasoning: "Witness testimony can provide crucial context"
          },
          {
            step: "Cross-reference with similar cases",
            priority: "MEDIUM",
            reasoning: "Pattern detection may reveal connections"
          },
          {
            step: "Collect additional evidence if needed",
            priority: "MEDIUM",
            reasoning: "Additional evidence may strengthen the case"
          }
        ]
      },
      relatedCases: [],
      externalContext: []
    }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { caseId } = await params

    // Fetch the case with all evidence
    const caseData = await prisma.case.findFirst({
      where: {
        id: caseId,
        officerId: session.user.id,
      },
      include: {
        evidence: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    // Fetch all other cases for pattern detection
    const allCases = await prisma.case.findMany({
      where: {
        id: {
          not: caseId
        },
        officerId: session.user.id,
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        description: true,
        category: true,
        location: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20, // Limit to recent cases for performance
    })

    // Perform AI analysis
    const analysis = await analyzeCaseWithGemini(caseData, allCases)

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error("Error in case analysis:", error)
    return NextResponse.json(
      { error: "Failed to analyze case" },
      { status: 500 }
    )
  }
}
