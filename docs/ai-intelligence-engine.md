# AI Intelligence Engine - Setup Guide

## Overview
The AI Intelligence Engine uses Google's Gemini AI with RAG (Retrieval-Augmented Generation) to provide comprehensive case analysis, including:
- AI-generated case summaries
- Key entity extraction (people, locations, organizations, objects)
- Suggested investigative next steps
- Cross-case pattern detection
- External context from public sources

## Setup Instructions

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

1. Open your `.env.local` file in the root directory
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. Save the file

### 3. Restart the Development Server

```bash
npm run dev
```

## How to Use

### Running an Analysis

1. Navigate to any case details page
2. Scroll down to the right sidebar
3. Find the "AI Intelligence Engine" card (below "Recent Activity")
4. Click the "Run Full Analysis" button
5. Wait for the analysis to complete (typically 5-15 seconds)

### Understanding the Results

The analysis is presented in three tabs:

#### Tab 1: Summary
- **AI-Generated Summary**: Key points about the case
- **Key Entities**: Extracted people, locations, organizations, and objects
- **Suggested Next Steps**: Actionable recommendations for investigators

#### Tab 2: Related Cases
- Shows potentially related cases from your database
- Each card displays:
  - Case number and title
  - Reason for flagging (similarity explanation)
  - View button to navigate to that case

#### Tab 3: External Context
- Public intelligence and contextual information
- Each item shows:
  - Event description
  - Source
  - Date
  - Relevance explanation

### Re-running Analysis

- Click the "Re-analyze" button at the bottom to run a fresh analysis
- Useful after adding new evidence or updating case details

## Features

### Internal Pattern Detection
- Compares current case with up to 20 recent cases
- Identifies similarities in:
  - Modus operandi (M.O.)
  - Locations
  - Evidence types
  - Categories
  - Descriptions

### External Context (RAG)
- Retrieves relevant public information
- Provides contextual intelligence
- Sources cited for transparency

### AI Analysis
- Powered by Gemini 1.5 Flash model
- Analyzes:
  - Case details (title, description, category, location, status, priority)
  - All evidence items and their metadata
  - Evidence notes and tags
  - Collection details

## Technical Details

### API Endpoint
- **URL**: `/api/cases/[caseId]/analyze`
- **Method**: POST
- **Authentication**: Required (session-based)

### Response Structure
```typescript
{
  success: boolean
  analysis: {
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
}
```

## Limitations

1. **API Costs**: Each analysis makes one API call to Gemini
2. **Rate Limits**: Subject to Google's API rate limits
3. **Accuracy**: AI-generated insights should be verified by investigators
4. **External Sources**: Currently provides general context; can be enhanced with specific data sources
5. **Case Limit**: Analyzes up to 20 recent cases for pattern detection

## Future Enhancements

Potential improvements:
- Integration with real news APIs for external context
- Vector database for semantic case search
- Custom model fine-tuning for domain-specific analysis
- Historical case database integration
- Multi-language support
- Evidence file content analysis (OCR, image recognition)

## Troubleshooting

### Analysis Fails
- Check that `GEMINI_API_KEY` is correctly set in `.env.local`
- Verify API key is active in Google AI Studio
- Check console for error messages
- Try running analysis again (temporary API issues)

### No Related Cases Found
- Normal if cases are very different
- More cases in database = better pattern detection
- Consider adding more detailed descriptions to cases

### External Context Empty
- This is expected in the current implementation
- Can be enhanced with specific data source integrations

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify environment configuration
3. Review API key permissions in Google AI Studio

---

**Note**: This is a powerful tool for investigative assistance, but all AI-generated insights should be verified and used as supplementary information by qualified investigators.
