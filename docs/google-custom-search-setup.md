# Google Custom Search API Setup Guide

## Why Google Custom Search?

Google Custom Search API allows you to programmatically search the web and get structured results. This enhances the AI Intelligence Engine by providing real-time external context from:
- News articles
- Legal databases
- Crime statistics
- Public records
- Research papers

## Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a Project" at the top
4. Click "New Project"
5. Enter a project name (e.g., "ChainGuard-AI")
6. Click "Create"

### Step 2: Enable Custom Search API

1. In the Google Cloud Console, go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for "Custom Search API"
3. Click on "Custom Search API"
4. Click "Enable"

### Step 3: Create API Credentials

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials"
3. Select "API Key"
4. Copy the API key (it will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
5. (Recommended) Click "Restrict Key" and:
   - Select "Custom Search API" under API restrictions
   - Add HTTP referrer restrictions for production

### Step 4: Create a Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all)
2. Click "Add" to create a new search engine
3. Configure your search engine:
   - **Name**: Enter a name (e.g., "ChainGuard Case Research")
   - **What to search**: Select "Search the entire web"
   - Check "Image search" and "Safe search" if desired
4. Click "Create"
5. On the next page, find your **Search Engine ID** (cx parameter)
   - It looks like: `a1b2c3d4e5f6g7h8i`
   - You can also find it in the "Setup" section later

### Step 5: Configure Your Environment

1. Open your `.env.local` file
2. Add your API credentials:
   ```bash
   # Google Custom Search (for RAG external context)
   GOOGLE_SEARCH_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
   ```
3. Save the file

### Step 6: Restart Your Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Free Tier Limits

- **100 search queries per day** for free
- Additional queries cost $5 per 1,000 queries
- For most applications, 100 queries/day is sufficient

## Testing Your Setup

1. Navigate to a case with details and evidence
2. Click "Run Full Analysis" in the AI Intelligence Engine
3. Check the "External Context" tab
4. You should see real search results from the web!

## Troubleshooting

### "API key not configured" error
- Check that `GOOGLE_SEARCH_API_KEY` is set in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart the development server

### "Search engine ID not found" error
- Check that `GOOGLE_SEARCH_ENGINE_ID` is set correctly
- Verify the ID in your [Programmable Search Console](https://programmablesearchengine.google.com/controlpanel/all)

### "Quota exceeded" error
- You've used all 100 free searches for the day
- Wait until tomorrow or upgrade to paid tier
- Consider caching results to reduce API calls

### No results appearing
- The API might be returning no results for your query
- Try with a different case that has more common terms
- Check the browser console for error messages

## Alternative: Run Without Google Search

The AI Intelligence Engine will work WITHOUT Google Custom Search API. It will:
- Still provide comprehensive AI analysis from Gemini
- Still detect related cases from your database
- Just won't include real-time web search results

To run without it, simply leave the environment variables blank or commented out.

## Cost Optimization Tips

1. **Cache Results**: Store search results to avoid repeat queries
2. **Limit Frequency**: Don't run analysis multiple times on the same case
3. **Batch Queries**: Combine similar searches when possible
4. **Monitor Usage**: Check your [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) regularly

## Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Programmable Search Engine](https://programmablesearchengine.google.com/)
- [Custom Search JSON API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Pricing Information](https://developers.google.com/custom-search/v1/overview#pricing)

---

**Need Help?** Check the console logs when running analysis to see detailed information about what's happening with your searches.
