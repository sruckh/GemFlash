# GemFlash Docker Management

Complete Docker container management system for the GemFlash project with multiple convenience interfaces.

## Quick Start

### Using Make (Recommended)
```bash
# Start development environment
make dev

# Follow logs in real-time
make logs-follow

# Open container shell
make shell

# Rebuild for development
make refresh

# Check application health
make health
```

### Using Scripts Directly
```bash
# Start container
./scripts/docker-manager.sh start

# Stop container
./scripts/docker-manager.sh stop

# Rebuild from scratch
./scripts/docker-manager.sh rebuild

# View logs
./scripts/docker-manager.sh logs -f
```

## Available Management Tools

### 1. Main Docker Manager (`scripts/docker-manager.sh`)

**Full-featured Docker management script with comprehensive controls:**

```bash
./scripts/docker-manager.sh [COMMAND] [OPTIONS]
```

**Commands:**
- `start` - Start the GemFlash container
- `stop` - Stop the GemFlash container
- `restart` - Restart the GemFlash container
- `rebuild` - Rebuild and start the container (clean build)
- `logs` - Show container logs (add `-f` for follow mode)
- `status` - Show container status and resource usage
- `clean` - Clean up Docker resources (removes everything)
- `shell` - Open bash shell in running container
- `help` - Show help message

**Features:**
- ✅ Automatic dependency checking (Docker, Docker Compose)
- ✅ External network management (`shared_net`)
- ✅ Comprehensive error handling
- ✅ Colored output for better readability
- ✅ Resource usage monitoring
- ✅ Safe cleanup with confirmation prompts

### 2. Development Script (`scripts/docker-dev.sh`)

**Quick commands for common development tasks:**

```bash
./scripts/docker-dev.sh [COMMAND]
```

**Commands:**
- `dev` - Start development environment with helpful info
- `logs` - Follow container logs
- `shell` - Open container shell
- `refresh` - Rebuild and restart
- `stop` - Stop development environment
- `status` - Show container status

### 3. Makefile Commands

**Easy-to-use make targets for all operations:**

```bash
# Container management
make start          # Start container
make stop           # Stop container
make restart        # Restart container
make rebuild        # Rebuild from scratch

# Monitoring
make logs           # Show recent logs
make logs-follow    # Follow logs in real-time
make status         # Show container status
make health         # Run health check

# Development
make dev            # Start development environment
make refresh        # Quick rebuild for development
make shell          # Open container shell

# Docker Compose (direct)
make up             # Basic docker-compose up
make down           # Basic docker-compose down
make build          # Basic docker-compose build

# Utilities
make clean          # Clean up Docker resources
make network        # Create shared network
make ps             # Show running containers
make images         # Show project images
make help           # Show all commands
```

### 4. Health Check (`scripts/health-check.sh`)

**Application health monitoring:**

```bash
./scripts/health-check.sh
# or
make health
```

**Checks:**
- ✅ Container running status
- ✅ Application HTTP response (port 8000)
- ✅ Resource usage monitoring
- ✅ CPU/Memory utilization alerts

## Project Structure

```
GemFlash/
├── docker-compose.yml          # Main compose configuration
├── Dockerfile                  # Multi-stage build configuration
├── Makefile                    # Make targets for easy management
├── scripts/
│   ├── docker-manager.sh       # Main management script
│   ├── docker-dev.sh          # Development shortcuts
│   └── health-check.sh         # Application health monitoring
└── docs/
    └── docker-management.md    # This documentation
```

## Configuration Details

### Docker Compose Configuration
- **Service Name**: `gemflash`
- **Network**: `shared_net` (external)
- **Environment**: Loaded from `.env` file
- **Port**: 8000 (exposed for web access)

### Multi-stage Dockerfile
1. **Favicon Generation**: Creates project favicon from remote image
2. **Frontend Build**: Builds React frontend with Node.js
3. **Backend**: Python FastAPI/Uvicorn backend with built frontend

### External Dependencies
- **Network**: `shared_net` - automatically created if missing
- **Environment**: `.env` file for configuration
- **Build Context**: Frontend and backend directories

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check Docker daemon
docker ps

# Check network
make network

# View detailed logs
make logs

# Force rebuild
make rebuild
```

**Application not responding:**
```bash
# Run health check
make health

# Check container status
make status

# Restart container
make restart
```

**Port conflicts:**
```bash
# Check what's using port 8000
sudo lsof -i :8000

# Stop conflicting services
sudo systemctl stop <service-name>
```

**Resource issues:**
```bash
# Check resource usage
make status

# Clean up Docker resources
make clean

# Restart Docker daemon
sudo systemctl restart docker
```

### Debug Mode

**Enable verbose logging:**
```bash
# Set debug environment
export DOCKER_BUILDKIT_PROGRESS=plain

# Rebuild with verbose output
docker-compose build --progress=plain --no-cache
```

**Container inspection:**
```bash
# Get container details
docker inspect $(docker-compose ps -q gemflash)

# Check container logs
docker logs $(docker-compose ps -q gemflash) --details
```

## Development Workflow

### Typical Development Session

1. **Start Environment**:
   ```bash
   make dev
   ```

2. **Make Code Changes**: Edit files in `frontend/` or `backend/`

3. **Refresh Application**:
   ```bash
   make refresh  # Rebuilds and restarts
   ```

4. **Monitor Logs**:
   ```bash
   make logs-follow
   ```

5. **Debug in Container**:
   ```bash
   make shell
   ```

6. **Check Health**:
   ```bash
   make health
   ```

7. **Stop When Done**:
   ```bash
   make stop
   ```

### Production Deployment

**For production deployments:**
```bash
# Build production image
make rebuild

# Check health
make health

# Monitor in production
make logs-follow
```

## Environment Variables

**Required `.env` file variables:**
```bash
# Add your environment variables here
# Example:
# API_KEY=your_api_key
# DATABASE_URL=your_db_url
# DEBUG=false
```

## Integration with Other Services

The GemFlash container integrates with the broader `/opt/docker` ecosystem:

- **Shared Network**: `shared_net` for inter-container communication
- **Nginx Proxy Manager**: For SSL termination and routing
- **Other Services**: Can communicate with other Docker services

---

**Need Help?** Run `make help` for a quick command reference or check the troubleshooting section above.