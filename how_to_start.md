# 🚀 ChainGuard Evidence Platform - Startup Guide

## 🎯 Private Repository - Ready to Run!

This repository includes **complete blockchain crypto material** for immediate deployment. No additional setup steps required!

### ✨ Fresh Clone Setup (First Time)
```bash
git clone https://github.com/sagarM1729/ChainGuard-Evidence-Platform.git
cd ChainGuard-Evidence-Platform
git checkout connect_backend
npm install
```

### 🚀 Quick Start (Every Time)
```bash
cd /home/ajay/Project/ChainGuard-Evidence-Platform
./start-blockchain.sh
```

### � Crypto Material Included

This repository includes:
- ✅ **Complete blockchain certificates** (54 files)
- ✅ **Private keys and TLS certificates**
- ✅ **Orderer and peer authentication material**
- ✅ **Ready-to-use crypto infrastructure**

**No crypto generation needed!** Your friend can clone and run immediately.

### �🔧 Manual Startup Steps (If needed)

#### Step 1: Navigate to Project Directory
```bash
cd /home/ajay/Project/ChainGuard-Evidence-Platform
```

#### Step 2: Start Hyperledger Fabric Blockchain Network
```bash
cd blockchain/network
sudo docker compose -f docker-compose-test.yaml up -d
```

#### Step 3: Verify Blockchain Containers are Running
```bash
sudo docker ps
```
**Expected Output:** You should see 3 containers running:
- `cli`
- `orderer.example.com`
- `peer0.org1.example.com`

#### Step 4: Return to Project Root
```bash
cd ../..
```

#### Step 5: Fix Proto Files (Temporary Step)
```bash
mkdir -p .next/server/chunks && cp fabric.proto .next/server/chunks/
mkdir -p .next/server/vendor-chunks && cp fabric.proto .next/server/vendor-chunks/
```

#### Step 6: Start Application with Real Blockchain
```bash
FABRIC_SIMULATION_MODE=false npm run dev
```

### ✅ Verification

1. **Application URL:** http://localhost:3001 (or 3000 if available)
2. **Check Logs:** Look for "✅ Fabric client initialized and connected successfully"
3. **No Simulation:** Should NOT see "⚠️ using simulation mode"

### 🛑 Troubleshooting

#### If Containers Fail to Start:
```bash
# Stop and clean up
cd blockchain/network
sudo docker compose -f docker-compose-test.yaml down -v

# Restart
sudo docker compose -f docker-compose-test.yaml up -d
```

#### If Still Getting Simulation Mode:
```bash
# Check if proto files exist
ls -la .next/server/chunks/fabric.proto
ls -la .next/server/vendor-chunks/fabric.proto

# If missing, copy them again
cp fabric.proto .next/server/chunks/
cp fabric.proto .next/server/vendor-chunks/
```

#### Check Blockchain Connection:
```bash
# View container logs
sudo docker logs orderer.example.com
sudo docker logs peer0.org1.example.com
```

### 📊 What Each Component Does

- **Hyperledger Fabric**: Real blockchain network for immutable evidence storage
- **PostgreSQL**: Evidence metadata and case information
- **IPFS/Storacha**: Decentralized file storage
- **Next.js App**: User interface and API endpoints

### 🎯 Success Indicators

✅ **Real Blockchain Active:**
- Evidence uploads show blockchain transaction IDs
- Chain of custody recorded on ledger
- Evidence verification uses cryptographic hashes
- No "simulation mode" warnings

❌ **Simulation Mode:**
- Evidence uploads work but no blockchain recording
- Shows "⚠️ using simulation mode" in logs
- No real immutable ledger

### 🔒 Security Features Active

When blockchain is running, you get:
- **Immutable Evidence Records**
- **Cryptographic Verification**
- **Tamper-Proof Chain of Custody**
- **Distributed Ledger Consensus**

---

## 🎉 Your Evidence Platform is Now Production-Ready!

Access your application: **http://localhost:3001**

**Login Credentials:** Use your registered account or create new one via signup page.
