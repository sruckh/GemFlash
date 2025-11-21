#!/bin/bash

# GemFlash Docker Management Script
# Usage: ./scripts/docker-manager.sh [start|stop|restart|rebuild|logs|status|clean|shell]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="gemflash"
COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="gemflash"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are available
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi

    # Determine docker compose command
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi
}

# Check if external network exists
check_network() {
    if ! docker network ls | grep -q "shared_net"; then
        log_warning "External network 'shared_net' not found. Creating it..."
        docker network create shared_net
        log_success "Created external network 'shared_net'"
    fi
}

# Start the container
start_container() {
    log_info "Starting GemFlash container..."
    check_network

    if [ -f "$COMPOSE_FILE" ]; then
        $DOCKER_COMPOSE up -d
        log_success "GemFlash container started successfully"
        show_status
    else
        log_error "docker-compose.yml not found in current directory"
        exit 1
    fi
}

# Stop the container
stop_container() {
    log_info "Stopping GemFlash container..."

    if [ -f "$COMPOSE_FILE" ]; then
        $DOCKER_COMPOSE down
        log_success "GemFlash container stopped successfully"
    else
        log_error "docker-compose.yml not found in current directory"
        exit 1
    fi
}

# Restart the container
restart_container() {
    log_info "Restarting GemFlash container..."
    stop_container
    start_container
}

# Rebuild and start the container
rebuild_container() {
    log_info "Rebuilding GemFlash container..."

    if [ -f "$COMPOSE_FILE" ]; then
        # Stop and remove containers
        $DOCKER_COMPOSE down --remove-orphans

        # Remove existing images
        log_info "Removing existing images..."
        docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs -r docker rmi -f || true

        # Build with no cache
        log_info "Building new images (this may take a while)..."
        $DOCKER_COMPOSE build --no-cache

        # Start the new container
        log_info "Starting rebuilt container..."
        start_container

        log_success "GemFlash container rebuilt and started successfully"
    else
        log_error "docker-compose.yml not found in current directory"
        exit 1
    fi
}

# Show container logs
show_logs() {
    log_info "Showing GemFlash container logs..."

    if [ -f "$COMPOSE_FILE" ]; then
        if [ "$2" = "-f" ] || [ "$2" = "--follow" ]; then
            $DOCKER_COMPOSE logs -f $SERVICE_NAME
        else
            $DOCKER_COMPOSE logs --tail=50 $SERVICE_NAME
        fi
    else
        log_error "docker-compose.yml not found in current directory"
        exit 1
    fi
}

# Show container status
show_status() {
    log_info "GemFlash container status:"
    echo ""

    if [ -f "$COMPOSE_FILE" ]; then
        $DOCKER_COMPOSE ps
        echo ""

        # Show container details if running
        if $DOCKER_COMPOSE ps | grep -q "Up"; then
            CONTAINER_ID=$($DOCKER_COMPOSE ps -q $SERVICE_NAME)
            if [ ! -z "$CONTAINER_ID" ]; then
                log_info "Container details:"
                docker inspect $CONTAINER_ID --format="Table {{.Name}}\t{{.State.Status}}\t{{.RestartCount}}\t{{.NetworkSettings.Ports}}"
                echo ""

                log_info "Resource usage:"
                docker stats $CONTAINER_ID --no-stream --format="table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
            fi
        fi
    else
        log_error "docker-compose.yml not found in current directory"
        exit 1
    fi
}

# Clean up Docker resources
clean_docker() {
    log_warning "This will remove all stopped containers, unused networks, images, and build cache."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning Docker resources..."

        # Stop and remove project containers
        $DOCKER_COMPOSE down --remove-orphans --volumes

        # Remove project images
        docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs -r docker rmi -f || true

        # Clean up Docker system
        docker system prune -f

        log_success "Docker cleanup completed"
    else
        log_info "Docker cleanup cancelled"
    fi
}

# Open shell in running container
open_shell() {
    log_info "Opening shell in GemFlash container..."

    CONTAINER_ID=$($DOCKER_COMPOSE ps -q $SERVICE_NAME)

    if [ ! -z "$CONTAINER_ID" ]; then
        if docker ps | grep -q $CONTAINER_ID; then
            log_info "Opening bash shell..."
            docker exec -it $CONTAINER_ID /bin/bash
        else
            log_error "Container is not running. Start it first with: $0 start"
            exit 1
        fi
    else
        log_error "No container found. Start it first with: $0 start"
        exit 1
    fi
}

# Show usage information
show_usage() {
    echo "GemFlash Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start     Start the GemFlash container"
    echo "  stop      Stop the GemFlash container"
    echo "  restart   Restart the GemFlash container"
    echo "  rebuild   Rebuild and start the container (clean build)"
    echo "  logs      Show container logs (add -f for follow mode)"
    echo "  status    Show container status and resource usage"
    echo "  clean     Clean up Docker resources (removes everything)"
    echo "  shell     Open bash shell in running container"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start the container"
    echo "  $0 logs -f        # Follow logs in real-time"
    echo "  $0 rebuild        # Rebuild from scratch"
    echo "  $0 status         # Check container status"
    echo ""
}

# Main script logic
main() {
    check_dependencies

    case "${1:-help}" in
        start)
            start_container
            ;;
        stop)
            stop_container
            ;;
        restart)
            restart_container
            ;;
        rebuild)
            rebuild_container
            ;;
        logs)
            show_logs "$@"
            ;;
        status)
            show_status
            ;;
        clean)
            clean_docker
            ;;
        shell)
            open_shell
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"