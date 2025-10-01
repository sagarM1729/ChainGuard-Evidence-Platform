import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { google } from "googleapis"

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables!")
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Initialize Google Custom Search
const customsearch = google.customsearch('v1')

interface AnalysisResult {
  caseSummary: {
    summary: string[]
    keyEntities: {
      people: string[]
      locations: string[]
      organizations: string[]
      objects: string[]
    }
    suggestedNextSteps: string[]
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

// Function to search the web for related information using Google Custom Search
async function searchWebForContext(caseTitle: string, caseDescription: string, category: string): Promise<Array<{
  title: string
  snippet: string
  link: string
  date: string
}>> {
  try {
    // Check if Google Custom Search is configured
    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      console.log("Google Custom Search not configured, using fallback")
      return []
    }

    // Create a search query based on case details
    const searchQuery = `${category} crime case legal precedent ${caseTitle}`.substring(0, 150)
    
    console.log("Searching web for:", searchQuery)

    // Perform Google Custom Search
    const response = await customsearch.cse.list({
      auth: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: searchQuery,
      num: 5, // Get top 5 results
      dateRestrict: 'y2', // Last 2 years
    })

    const results = response.data.items || []
    
    return results.map((item: any) => ({
      title: item.title || '',
      snippet: item.snippet || '',
      link: item.link || '',
      date: item.pagemap?.metatags?.[0]?.['article:published_time'] || new Date().toISOString().split('T')[0]
    }))
  } catch (error) {
    console.error("Error searching web:", error)
    return []
  }
}

// Function to analyze case with Gemini AI
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
    "suggestedNextSteps": ["actionable step 1", "actionable step 2", ...]
  },
  "relatedCases": [
    {
      "caseNumber": "case number from the list",
      "title": "case title",
      "reasonForFlagging": "detailed explanation of similarity",
      "caseId": "case id"
    }
  ],
  "externalContext": [
    {
      "eventDescription": "description of relevant external event or information",
      "source": "source name",
      "date": "date if available",
      "relevance": "explanation of why this is relevant"
    }
  ]
}

Focus on:
1. Identifying patterns, inconsistencies, and key details
2. Finding similar cases based on M.O., location, evidence types, or other factors
3. Suggesting logical next investigative steps
4. Providing contextual information that might be relevant to the investigation

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

    // Get web context from Google Search
    const webContexts = await searchWebForContext(
      caseData.title,
      caseData.description,
      caseData.category
    )

    // Add web-based external context from Google Search results
    webContexts.forEach(context => {
      analysis.externalContext.push({
        eventDescription: `${context.title}: ${context.snippet}`,
        source: context.link,
        date: context.date,
        relevance: "External information from web search related to case category and details"
      })
    })

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
        suggestedNextSteps: [
          "Review all collected evidence thoroughly",
          "Interview relevant witnesses",
          "Cross-reference with similar cases",
          "Collect additional evidence if needed"
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
