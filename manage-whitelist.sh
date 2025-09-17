#!/bin/bash

# ChainGuard Evidence Platform - Whitelist Management Script
echo "🔐 ChainGuard Evidence Platform - Whitelist Management"
echo "===================================================="

# Option 1: Open Prisma Studio for GUI management
echo "🖥️  Opening Prisma Studio for whitelist management..."
echo "   Navigate to the 'Whitelist' model to add/remove emails"
echo "   URL: http://localhost:5555"
echo ""

# Uncomment the line below to open Prisma Studio
# npx prisma studio

# Option 2: Add emails via command line
echo "📧 To add emails to whitelist, run:"
echo "   npx prisma db execute --file update-whitelist.sql"
echo ""

# Option 3: View current whitelist
echo "📋 To view current whitelist:"
echo "   psql -h localhost -U chainguard -d chainguard_evidence -c \"SELECT * FROM \\\"Whitelist\\\" ORDER BY email;\""
echo ""

echo "✅ Choose your preferred method above!"