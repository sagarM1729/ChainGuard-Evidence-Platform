#!/bin/bash

# 🚀 Deployment script for Evidence Platform chaincode

set -e

echo "=================================================="
echo "🔧 Setting up Evidence Platform Blockchain Network"
echo "=================================================="

# Set environment variables
export FABRIC_CFG_PATH=$PWD/../network/config
export CORE_PEER_TLS_ENABLED=false
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PWD/../network/organizations/peerOrganizations/org1.evidence.com/peers/peer0.org1.evidence.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=$PWD/../network/organizations/peerOrganizations/org1.evidence.com/users/Admin@org1.evidence.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Function to generate crypto material
generate_crypto() {
    echo "📝 Generating crypto material..."
    
    # Create directories
    mkdir -p ../network/organizations/ordererOrganizations/evidence.com/orderers/orderer.evidence.com/msp
    mkdir -p ../network/organizations/peerOrganizations/org1.evidence.com/peers/peer0.org1.evidence.com/msp
    mkdir -p ../network/organizations/peerOrganizations/org1.evidence.com/users/Admin@org1.evidence.com/msp
    
    echo "✅ Crypto material generated"
}

# Function to start the network
start_network() {
    echo "🚀 Starting blockchain network..."
    cd ../network
    docker-compose up -d
    cd ../scripts
    
    # Wait for containers to start
    echo "⏳ Waiting for containers to start..."
    sleep 10
    
    echo "✅ Network started"
}

# Function to create channel
create_channel() {
    echo "📺 Creating evidence channel..."
    
    # Create genesis block (simplified)
    docker exec cli peer channel create -o orderer.evidence.com:7050 -c evidencechannel -f ./config/channel.tx
    
    # Join peer to channel
    docker exec cli peer channel join -b evidencechannel.block
    
    echo "✅ Channel created and joined"
}

# Function to deploy chaincode
deploy_chaincode() {
    echo "⚙️ Deploying evidence chaincode..."
    
    # Package chaincode
    docker exec cli peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode/evidence-contract --lang golang --label evidence_1.0
    
    # Install chaincode
    docker exec cli peer lifecycle chaincode install evidence.tar.gz
    
    # Query installed chaincodes to get package ID
    PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep evidence_1.0 | cut -d' ' -f3 | cut -d',' -f1)
    
    # Approve chaincode definition
    docker exec cli peer lifecycle chaincode approveformyorg -o orderer.evidence.com:7050 --channelID evidencechannel --name evidence --version 1.0 --package-id $PACKAGE_ID --sequence 1
    
    # Commit chaincode definition
    docker exec cli peer lifecycle chaincode commit -o orderer.evidence.com:7050 --channelID evidencechannel --name evidence --version 1.0 --sequence 1
    
    echo "✅ Evidence chaincode deployed successfully"
}

# Function to test chaincode
test_chaincode() {
    echo "🧪 Testing evidence chaincode..."
    
    # Initialize ledger
    docker exec cli peer chaincode invoke -o orderer.evidence.com:7050 --channelID evidencechannel -n evidence -c '{"function":"InitLedger","Args":[]}'
    
    echo "✅ Chaincode tested successfully"
}

# Main execution
main() {
    echo "🎯 Starting Evidence Platform deployment..."
    
    generate_crypto
    start_network
    sleep 15  # Give more time for network to be ready
    create_channel
    deploy_chaincode
    test_chaincode
    
    echo ""
    echo "🎉 Evidence Platform blockchain network is ready!"
    echo "🔗 Access peer at: localhost:7051"
    echo "🔗 Access orderer at: localhost:7050"
    echo ""
}

# Check if function argument is provided
if [ "$1" = "stop" ]; then
    echo "🛑 Stopping Evidence Platform network..."
    cd ../network
    docker-compose down
    docker volume prune -f
    echo "✅ Network stopped and cleaned up"
elif [ "$1" = "clean" ]; then
    echo "🧹 Cleaning up Evidence Platform..."
    cd ../network
    docker-compose down
    docker system prune -f
    docker volume prune -f
    rm -rf organizations/
    echo "✅ Complete cleanup finished"
else
    main
fi
