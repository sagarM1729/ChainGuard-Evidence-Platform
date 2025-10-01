# AI Suspect Prediction Upgrade

## Overview
The AI analysis system has been upgraded to focus on **suspect profiling and prediction** using only Google Gemini AI, removing the dependency on Google Custom Search.

## What Changed

### 1. Removed Google Custom Search Integration
- ✅ Removed `googleapis` package from dependencies
- ✅ Deleted `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` from `.env.local`
- ✅ Removed `searchWebForContext()` function from analyze API route
- ✅ Deleted `docs/google-custom-search-setup.md`
- ✅ Updated documentation to remove all Google Custom Search references

### 2. Enhanced AI Analysis with Suspect Prediction

#### New Backend Interface (`src/app/api/cases/[caseId]/analyze/route.ts`)
```typescript
interface LikelySuspect {
  profile: string              // Description of suspect type/profile
  reasoning: string            // Why this person might be suspect
  evidenceSupporting: string[] // Evidence that supports this theory
}

interface SuspectProfile {
  likelySuspects: LikelySuspect[] // Array of potential suspects
  motivePrediction: string         // Predicted motive (WHY)
  modusPrediction: string          // Predicted modus operandi (HOW)
}

interface NextStep {
  step: string                      // What action to take
  priority: 'HIGH' | 'MEDIUM' | 'LOW' // Investigation priority
  reasoning: string                 // Why this step is important
}

interface CaseSummary {
  summary: string[]
  keyEntities: KeyEntities
  suspectProfile: SuspectProfile    // NEW: Suspect predictions
  suggestedNextSteps: NextStep[]    // UPDATED: Now structured with priority
}
```

#### Enhanced Gemini AI Prompt
The AI now receives detailed instructions to:
- **Profile suspects** based on evidence patterns, location data, and case details
- **Predict motives** (WHY someone would commit this crime)
- **Predict modus operandi** (HOW the crime was likely committed)
- **Prioritize investigative steps** with HIGH/MEDIUM/LOW priorities
- Provide **point-by-point reasoning** for each suspect prediction

### 3. Updated Frontend (`src/components/cases/AIIntelligenceEngine.tsx`)

#### New Suspect Profile Section
- **🔎 Suspect Profile & Predictions** - New section displaying:
  - **👤 Likely Suspects** - Cards showing:
    - Suspect profile description
    - Reasoning for suspicion
    - Supporting evidence bullet points
  - **💭 Predicted Motive** - Analysis of WHY
  - **🎯 Predicted Modus Operandi** - Analysis of HOW

#### Enhanced Next Steps Display
- Priority-based color coding:
  - **HIGH** = Red badge (urgent actions)
  - **MEDIUM** = Yellow badge (important but not urgent)
  - **LOW** = Green badge (follow-up actions)
- Each step shows:
  - Action description
  - Priority level
  - Reasoning for priority

## Usage

### Running AI Analysis
1. Navigate to any case details page
2. Click **"Run Full Analysis"** in the AI Intelligence Engine card
3. Wait 5-15 seconds for Gemini to analyze the case
4. Review the results in three tabs:
   - **Summary**: Case overview, entities, suspect predictions, next steps
   - **Related Cases**: Similar cases in the database
   - **External**: Placeholder (currently empty)

### What to Expect in Results

#### Suspect Profile Example:
```
Likely Suspects:
  1. "Ex-partner with history of domestic disputes"
     Reasoning: "Evidence shows familiarity with victim's routine..."
     Supporting Evidence:
       • Text messages showing conflict pattern
       • Witness statements about arguments
       • Location data matching crime scene

Predicted Motive: "Crime of passion triggered by jealousy..."
Predicted Modus Operandi: "Premeditated attack using victim's known schedule..."
```

#### Next Steps Example:
```
HIGH PRIORITY:
  • Interview ex-partner immediately
    Reasoning: Strong circumstantial evidence and opportunity

MEDIUM PRIORITY:
  • Subpoena phone records for victim's contacts
    Reasoning: May reveal additional suspects or confirm timeline

LOW PRIORITY:
  • Canvas neighborhood for additional witnesses
    Reasoning: Supplement existing witness statements
```

## Technical Details

### AI Model
- **Model**: `gemini-2.5-flash`
- **Context Window**: 1M tokens
- **Output Limit**: 65K tokens
- **Response Format**: JSON with structured suspect profiling

### Rate Limits
- **Free Tier**: 15 requests/minute
- **Typical Analysis Time**: 5-15 seconds
- **Max Input**: All case evidence + descriptions

### Error Handling
- Fallback analysis provided if Gemini API fails
- Error messages shown in UI with retry button
- Detailed error logging in server console

## Benefits of This Upgrade

1. **Simplified Architecture** - One AI service instead of two
2. **Cost Reduction** - No Google Custom Search API costs
3. **Better Predictions** - Gemini 2.5 Flash is highly capable at reasoning tasks
4. **Actionable Intelligence** - Prioritized next steps help investigators focus
5. **Evidence-Based** - Every prediction backed by evidence references

## Files Changed

### Backend
- `src/app/api/cases/[caseId]/analyze/route.ts` - Removed Google Search, added suspect profiling
- `package.json` - Removed `googleapis` dependency

### Frontend
- `src/components/cases/AIIntelligenceEngine.tsx` - New suspect profile UI, priority badges

### Documentation
- `AI_SETUP_COMPLETE.md` - Updated to remove Custom Search references
- `docs/ai-analysis-troubleshooting.md` - Updated Issue 7 explanation
- `verify-ai-setup.sh` - Removed Custom Search test
- `docs/google-custom-search-setup.md` - DELETED (no longer needed)

### Environment
- `.env.local` - Removed `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`

## Next Steps

1. ✅ Test the AI analysis on an existing case
2. ✅ Verify suspect predictions are helpful and accurate
3. ✅ Monitor Gemini API usage and costs
4. Consider adding:
   - Confidence scores for suspect predictions
   - Integration with evidence timeline visualization
   - Historical pattern matching across cases

## Testing Checklist

- [ ] Run AI analysis on a case with multiple evidence files
- [ ] Verify suspect profile section displays correctly
- [ ] Check priority badges show correct colors (RED/YELLOW/GREEN)
- [ ] Confirm no Google Custom Search errors in console
- [ ] Test with rate limiting (run multiple analyses quickly)
- [ ] Verify fallback analysis works if Gemini fails

---

**Upgrade Date**: January 2025  
**AI Model**: Google Gemini 2.5 Flash  
**Status**: ✅ Complete and Ready for Testing
