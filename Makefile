# GemFlash Docker Management Makefile

.PHONY: help start stop restart rebuild logs status clean shell dev

# Default target
.DEFAULT_GOAL := help

# Docker management commands
start: ## Start the GemFlash container
	@./scripts/docker-manager.sh start

stop: ## Stop the GemFlash container
	@./scripts/docker-manager.sh stop

restart: ## Restart the GemFlash container
	@./scripts/docker-manager.sh restart

rebuild: ## Rebuild and start the container (clean build)
	@./scripts/docker-manager.sh rebuild

logs: ## Show container logs (add 'make logs-follow' for real-time)
	@./scripts/docker-manager.sh logs

logs-follow: ## Follow container logs in real-time
	@./scripts/docker-manager.sh logs -f

status: ## Show container status and resource usage
	@./scripts/docker-manager.sh status

clean: ## Clean up Docker resources (removes everything)
	@./scripts/docker-manager.sh clean

shell: ## Open bash shell in running container
	@./scripts/docker-manager.sh shell

health: ## Run health check on the application
	@./scripts/health-check.sh

# Development shortcuts
dev: ## Start development environment with helpful info
	@./scripts/docker-dev.sh dev

refresh: ## Quick rebuild and restart for development
	@./scripts/docker-dev.sh refresh

# Docker Compose commands (direct)
up: ## Docker compose up (basic start)
	@docker-compose up -d

down: ## Docker compose down (basic stop)
	@docker-compose down

build: ## Docker compose build (basic build)
	@docker-compose build

# Quick status checks
ps: ## Show running containers
	@docker-compose ps

images: ## Show project images
	@docker images | grep -E "(REPOSITORY|gemflash)" || echo "No project images found"

# Network management
network: ## Create shared network if it doesn't exist
	@docker network ls | grep -q "shared_net" || docker network create shared_net

# Help target
help: ## Show this help message
	@echo "GemFlash Docker Management Commands"
	@echo ""
	@echo "Usage: make [COMMAND]"
	@echo ""
	@echo "Main Commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Quick Start:"
	@echo "  make dev         # Start development environment"
	@echo "  make logs-follow # Watch logs in real-time"
	@echo "  make shell       # Open container shell"
	@echo "  make refresh     # Rebuild for development"
	@echo ""