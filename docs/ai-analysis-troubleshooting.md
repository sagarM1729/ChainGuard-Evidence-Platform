# AI Analysis Troubleshooting Guide

## How to Debug AI Analysis Issues

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click > Inspect)
2. Go to the "Console" tab
3. Click "Run Full Analysis" on a case
4. Watch for error messages

### Step 2: Check Server Logs

1. Look at your terminal where `npm run dev` is running
2. You should see logs like:
   ```
   Starting Gemini analysis for case: CASE-2024-001
   Sending prompt to Gemini AI...
   Received response from Gemini AI, length: 1234
   Parsing JSON response...
   Analysis complete, found 2 related cases
   ```

### Common Issues and Solutions

#### Issue 1: "GEMINI_API_KEY is not configured"

**Cause**: API key not set in environment
**Solution**:
1. Check `.env.local` file
2. Make sure this line exists:
   ```
   GEMINI_API_KEY=AIzaSyCm4u5MjhanWPmBvALs064DFb7r7ChkqIM
   ```
3. Restart the server: `npm run dev`

#### Issue 2: "Failed to analyze case (401)"

**Cause**: Invalid or expired API key
**Solution**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Check if your API key is still active
3. Generate a new key if needed
4. Update `.env.local` with the new key
5. Restart the server

#### Issue 3: "Failed to analyze case (429)"

**Cause**: Rate limit exceeded
**Solution**:
- You've hit Gemini's rate limit
- Wait a few minutes before trying again
- Consider upgrading your Gemini API plan

#### Issue 4: "Case not found"

**Cause**: User doesn't own the case they're trying to analyze
**Solution**:
- Make sure you're logged in as the user who created the case
- Try analyzing a different case

#### Issue 5: Analysis never completes (stuck on loading)

**Possible Causes**:
1. Network timeout
2. Very large case with lots of evidence
3. Gemini API is slow

**Solutions**:
1. Check your internet connection
2. Wait longer (analysis can take 10-30 seconds for complex cases)
3. Try again with a simpler case first
4. Check server logs for errors

#### Issue 6: No related cases found

**This is normal if**:
- The case is unique
- You only have a few cases in your database
- Cases are very different from each other

**To improve results**:
- Add more cases to your database
- Use detailed descriptions with specific terms
- Include case categories

#### Issue 7: External context is empty

**This is normal** - External context is currently a placeholder feature. The AI analysis focuses on internal case data, evidence patterns, and suspect profiling using Google Gemini AI.

## Testing the API Directly

You can test the API endpoint directly using curl:

```bash
# Replace YOUR_CASE_ID with an actual case ID
curl -X POST http://localhost:3001/api/cases/YOUR_CASE_ID/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

## Still Having Issues?

1. **Check Environment Variables**:
   ```bash
   cat .env.local | grep GEMINI
   ```
   Should show your API key

2. **Verify Gemini API Key**:
   - Go to https://makersuite.google.com/app/apikey
   - Make sure your key is active
   - Test it in the AI Studio first

3. **Check Server is Running**:
   - Should see "Ready in X.Xs" in terminal
   - Try accessing http://localhost:3001 (or 3000)

4. **Clear Browser Cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear all cache and cookies

5. **Check Network Tab**:
   - Open Developer Tools > Network tab
   - Click "Run Analysis"
   - Look for the `/analyze` request
   - Check its response

## Expected Behavior

When working correctly, you should see:

1. **Loading State**: Spinner with progress messages (5-15 seconds)
2. **Results Display**: Three tabs appear
   - Summary tab shows bullet points
   - Related Cases shows similar cases (may be 0)
   - External Context shows web results (if configured)
3. **Re-analyze Button**: Can run again for fresh analysis

## Need More Help?

Check the logs in:
- Browser console (F12 > Console)
- Server terminal (where npm run dev is running)
- Look for red error messages

Share the error messages for more specific help!
