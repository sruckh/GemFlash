#!/bin/bash

# GemFlash Development Docker Script
# Quick commands for common development tasks

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Quick development commands
case "${1:-help}" in
    "dev")
        log_info "Starting development environment..."
        ./scripts/docker-manager.sh start
        log_success "Development environment ready!"
        echo ""
        echo "Available at:"
        echo "  - Frontend: http://localhost:8000"
        echo "  - Backend API: http://localhost:8000/api"
        echo ""
        echo "Quick commands:"
        echo "  ./scripts/docker-dev.sh logs    # View logs"
        echo "  ./scripts/docker-dev.sh shell   # Open container shell"
        echo "  ./scripts/docker-dev.sh refresh # Rebuild and restart"
        ;;
    "logs")
        ./scripts/docker-manager.sh logs -f
        ;;
    "shell")
        ./scripts/docker-manager.sh shell
        ;;
    "refresh")
        log_info "Refreshing development environment..."
        ./scripts/docker-manager.sh rebuild
        ;;
    "stop")
        ./scripts/docker-manager.sh stop
        ;;
    "status")
        ./scripts/docker-manager.sh status
        ;;
    *)
        echo "GemFlash Development Quick Commands"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  dev      Start development environment"
        echo "  logs     Follow container logs"
        echo "  shell    Open container shell"
        echo "  refresh  Rebuild and restart"
        echo "  stop     Stop development environment"
        echo "  status   Show container status"
        ;;
esac