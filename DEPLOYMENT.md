# 🚀 ChainGuard Evidence Platform - Deployment Guide

## 🎯 Private Repository - Complete Setup Included

This private repository contains **everything needed** to run the ChainGuard Evidence Platform immediately after cloning.

## ✨ What's Included

### 🔐 Blockchain Infrastructure
- **Complete Hyperledger Fabric crypto material** (54 certificate files)
- **Private keys and TLS certificates** for secure blockchain communication
- **Orderer and peer organization certificates** ready for network startup
- **Admin and user authentication credentials** pre-configured

### 📁 Key Directories
```
blockchain/network/organizations/
├── ordererOrganizations/example.com/     # Orderer certificates & keys
│   ├── ca/                               # Certificate Authority
│   ├── msp/                              # Membership Service Provider
│   ├── orderers/orderer.example.com/     # Orderer node certificates
│   ├── tlsca/                            # TLS Certificate Authority
│   └── users/Admin@example.com/          # Admin user credentials
└── peerOrganizations/org1.example.com/   # Peer organization certificates
    ├── ca/                               # Certificate Authority
    ├── msp/                              # Membership Service Provider  
    ├── peers/peer0.org1.example.com/     # Peer node certificates
    ├── tlsca/                            # TLS Certificate Authority
    └── users/                            # Admin and User1 credentials
```

## 🚀 Quick Deployment

### For New Team Members
```bash
# 1. Clone the private repository
git clone https://github.com/sagarM1729/ChainGuard-Evidence-Platform.git
cd ChainGuard-Evidence-Platform

# 2. Switch to the working branch
git checkout connect_backend

# 3. Install dependencies
npm install

# 4. Start the complete platform
./start-blockchain.sh
```

### Daily Development
```bash
# Navigate to project
cd ChainGuard-Evidence-Platform

# Start everything (blockchain + app)
./start-blockchain.sh
```

## 🔒 Security Approach

### Private Repository Benefits
- ✅ **Immediate deployment** - No crypto generation delays
- ✅ **Team consistency** - Everyone uses identical certificates
- ✅ **Development speed** - Skip complex Hyperledger Fabric setup
- ✅ **Plug-and-play** - Works immediately after git clone

### Security Considerations
- 🔐 **Private repo only** - Never expose crypto material publicly
- 🛡️ **Development certificates** - Not for production use
- 🔄 **Regenerate for production** - Use fresh crypto for live deployments
- 🚫 **Never commit to public repos** - Contains private keys

## 🎯 What This Enables

Your team members can:
1. **Clone the repo** and have a working blockchain network in minutes
2. **Skip complex Hyperledger Fabric installation** and crypto generation
3. **Focus on application development** instead of infrastructure setup
4. **Have identical development environments** across all machines

## 📋 Network Configuration

### Blockchain Network
- **Orderer:** `orderer.example.com:7050`
- **Peer:** `peer0.org1.example.com:7051`
- **Organization:** `Org1MSP`
- **Channel:** `evidencechannel`

### Application Services
- **Next.js App:** `http://localhost:3000`
- **Database:** PostgreSQL/Neon Cloud
- **IPFS Storage:** Storacha with Pinata fallback
- **Blockchain:** Hyperledger Fabric 2.5.9

## 🛠️ Troubleshooting

If crypto material causes issues:
```bash
# Clean and regenerate (advanced users only)
cd blockchain/network
sudo rm -rf organizations/
# Then use cryptogen to regenerate...
```

For most users: **The included crypto material works perfectly!**

---

**Ready to develop?** Just clone, install, and run! 🚀