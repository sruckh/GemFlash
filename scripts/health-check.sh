#!/bin/bash

# GemFlash Health Check Script
# Checks if the application is running and accessible

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Check if container is running
check_container() {
    if docker-compose ps | grep -q "Up"; then
        log_success "Container is running"
        return 0
    else
        log_error "Container is not running"
        return 1
    fi
}

# Check if application is responding
check_app_health() {
    local max_attempts=5
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200"; then
            log_success "Application is responding (HTTP 200)"
            return 0
        fi

        log_warning "Attempt $attempt/$max_attempts: Application not responding, waiting..."
        sleep 2
        ((attempt++))
    done

    log_error "Application is not responding after $max_attempts attempts"
    return 1
}

# Check container resources
check_resources() {
    local container_id=$(docker-compose ps -q gemflash)

    if [ ! -z "$container_id" ]; then
        local stats=$(docker stats $container_id --no-stream --format "{{.CPUPerc}} {{.MemUsage}}")
        local cpu=$(echo $stats | cut -d' ' -f1)
        local memory=$(echo $stats | cut -d' ' -f2)

        echo "Resource Usage:"
        echo "  CPU: $cpu"
        echo "  Memory: $memory"

        # Check if CPU usage is too high (above 90%)
        local cpu_num=$(echo $cpu | sed 's/%//')
        if (( $(echo "$cpu_num > 90" | bc -l) )); then
            log_warning "High CPU usage detected: $cpu"
        else
            log_success "CPU usage normal: $cpu"
        fi
    fi
}

# Main health check
main() {
    echo "🔍 GemFlash Health Check"
    echo "========================"
    echo ""

    local exit_code=0

    # Check container status
    if ! check_container; then
        exit_code=1
    fi

    echo ""

    # Check application health
    if ! check_app_health; then
        exit_code=1
    fi

    echo ""

    # Check resources if container is running
    if [ $exit_code -eq 0 ]; then
        check_resources
    fi

    echo ""

    if [ $exit_code -eq 0 ]; then
        log_success "All health checks passed!"
    else
        log_error "Some health checks failed!"
        echo ""
        echo "Troubleshooting:"
        echo "  1. Check logs: make logs"
        echo "  2. Restart container: make restart"
        echo "  3. Rebuild container: make rebuild"
    fi

    return $exit_code
}

main "$@"