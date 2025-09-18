#!/bin/bash

echo "🚀 Starting ChainGuard Evidence Platform with Real Blockchain..."

# Navigate to project directory
cd /home/ajay/Project/ChainGuard-Evidence-Platform

echo "📦 Starting Hyperledger Fabric Network..."
cd blockchain/network
sudo docker compose -f docker-compose-test.yaml up -d

# Wait for containers to start
sleep 10

echo "🔍 Checking container status..."
sudo docker ps

echo "💻 Starting Next.js Application..."
cd ../..

echo "🌐 Application will be available at: http://localhost:3001"
echo "⛓️  Running with REAL BLOCKCHAIN (not simulation)"

# Start the application with blockchain enabled
FABRIC_SIMULATION_MODE=false npm run dev