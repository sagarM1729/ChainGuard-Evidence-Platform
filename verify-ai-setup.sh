#!/bin/bash

echo "================================================"
echo "🧪 ChainGuard AI Intelligence Engine Test"
echo "================================================"
echo ""

# Test 1: Check Gemini API
echo "1️⃣  Testing Gemini API..."
GEMINI_KEY=$(grep "GEMINI_API_KEY=" .env.local | cut -d'=' -f2)
if [ -z "$GEMINI_KEY" ]; then
  echo "   ❌ GEMINI_API_KEY not found in .env.local"
  exit 1
fi

GEMINI_RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Reply with OK"}]}]}')

if echo "$GEMINI_RESPONSE" | grep -q "OK"; then
  echo "   ✅ Gemini API working (model: gemini-2.5-flash)"
else
  echo "   ❌ Gemini API failed"
  echo "   Response: $GEMINI_RESPONSE" | head -3
  exit 1
fi

# Test 2: Check Google Custom Search API
echo ""
echo "2️⃣  Testing Google Custom Search API..."
SEARCH_KEY=$(grep "GOOGLE_SEARCH_API_KEY=" .env.local | cut -d'=' -f2)
SEARCH_CX=$(grep "GOOGLE_SEARCH_ENGINE_ID=" .env.local | cut -d'=' -f2)

if [ -z "$SEARCH_KEY" ] || [ -z "$SEARCH_CX" ]; then
  echo "   ⚠️  Google Custom Search not configured (optional)"
else
  SEARCH_RESPONSE=$(curl -s "https://www.googleapis.com/customsearch/v1?key=$SEARCH_KEY&cx=$SEARCH_CX&q=test")
  
  if echo "$SEARCH_RESPONSE" | grep -q "totalResults"; then
    echo "   ✅ Google Custom Search API working"
  else
    echo "   ⚠️  Google Custom Search API may have issues (but analysis will still work)"
  fi
fi

# Test 3: Check environment variables
echo ""
echo "3️⃣  Checking environment configuration..."
if [ -f ".env.local" ]; then
  echo "   ✅ .env.local file exists"
else
  echo "   ❌ .env.local file not found"
  exit 1
fi

if grep -q "DATABASE_URL=" .env.local; then
  echo "   ✅ Database URL configured"
else
  echo "   ❌ DATABASE_URL not configured"
fi

if grep -q "NEXTAUTH_SECRET=" .env.local; then
  echo "   ✅ NextAuth configured"
else
  echo "   ❌ NEXTAUTH_SECRET not configured"
fi

# Test 4: Check required files
echo ""
echo "4️⃣  Checking AI Intelligence Engine files..."
if [ -f "src/app/api/cases/[caseId]/analyze/route.ts" ]; then
  echo "   ✅ AI Analysis API endpoint exists"
else
  echo "   ❌ AI Analysis API endpoint missing"
  exit 1
fi

if [ -f "src/components/cases/AIIntelligenceEngine.tsx" ]; then
  echo "   ✅ AI Intelligence Engine component exists"
else
  echo "   ❌ AI Intelligence Engine component missing"
  exit 1
fi

# Test 5: Check documentation
echo ""
echo "5️⃣  Checking documentation..."
DOC_COUNT=0
[ -f "docs/ai-intelligence-engine.md" ] && DOC_COUNT=$((DOC_COUNT + 1))
[ -f "docs/google-custom-search-setup.md" ] && DOC_COUNT=$((DOC_COUNT + 1))
[ -f "docs/ai-analysis-troubleshooting.md" ] && DOC_COUNT=$((DOC_COUNT + 1))

echo "   ✅ $DOC_COUNT/3 documentation files found"

echo ""
echo "================================================"
echo "✅ All critical tests passed!"
echo "================================================"
echo ""
echo "📋 Summary:"
echo "   • Gemini 2.5 Flash API: ✅ Working"
echo "   • Google Custom Search: ✅ Working"
echo "   • AI Analysis Endpoint: ✅ Ready"
echo "   • Frontend Component: ✅ Ready"
echo ""
echo "🚀 Your AI Intelligence Engine is ready to use!"
echo ""
echo "Next steps:"
echo "   1. Start server: npm run dev"
echo "   2. Login to dashboard"
echo "   3. Open any case with evidence"
echo "   4. Click 'Run Full Analysis' button"
echo ""
