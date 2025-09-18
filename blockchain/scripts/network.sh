#!/bin/bash

# Simple Evidence Platform Network Manager
# This script manages the blockchain network for the Evidence Platform

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NETWORK_DIR="$SCRIPT_DIR/../network"

show_usage() {
    echo "Usage: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start    - Start the evidence blockchain network"
    echo "  stop     - Stop the network and clean up"
    echo "  restart  - Restart the network"
    echo "  status   - Show network status"
    echo "  logs     - Show container logs"
    echo ""
}

start_network() {
    echo "🚀 Starting Evidence Platform Blockchain Network..."
    
    cd "$NETWORK_DIR"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Start the network
    docker compose up -d
    
    echo "⏳ Waiting for network to initialize..."
    sleep 10
    
    # Check if containers are running
    if docker compose ps | grep -q "Up"; then
        echo "✅ Evidence blockchain network is running!"
        echo ""
        echo "📊 Network Status:"
        docker compose ps
        echo ""
        echo "🔗 Network endpoints:"
        echo "   Peer:    localhost:7051"
        echo "   Orderer: localhost:7050"
        echo ""
        echo "📝 To deploy chaincode, run: ./deploy.sh"
    else
        echo "❌ Failed to start network. Check logs with: $0 logs"
        exit 1
    fi
}

stop_network() {
    echo "🛑 Stopping Evidence Platform network..."
    
    cd "$NETWORK_DIR"
    docker compose down -v
    
    # Clean up any remaining containers
    docker container prune -f
    docker volume prune -f
    
    echo "✅ Network stopped and cleaned up"
}

restart_network() {
    echo "🔄 Restarting Evidence Platform network..."
    stop_network
    sleep 5
    start_network
}

show_status() {
    echo "📊 Evidence Platform Network Status:"
    echo ""
    
    cd "$NETWORK_DIR"
    
    if docker compose ps | grep -q "Up"; then
        echo "✅ Network is running"
        echo ""
        docker compose ps
    else
        echo "❌ Network is not running"
        echo ""
        echo "To start the network, run: $0 start"
    fi
}

show_logs() {
    echo "📋 Evidence Platform Network Logs:"
    echo ""
    
    cd "$NETWORK_DIR"
    docker compose logs --tail=50 -f
}

# Main script logic
case "${1:-}" in
    start)
        start_network
        ;;
    stop)
        stop_network
        ;;
    restart)
        restart_network
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        show_usage
        exit 1
        ;;
esac