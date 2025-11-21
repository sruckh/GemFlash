# GemFlash - Gemini-Powered Image Generation & Editing

A modern web application that leverages Google Gemini 3 to generate, edit, and compose images with an intuitive React frontend and FastAPI backend.

## Features

### Generate Tab
Create images from text prompts using the power of Gemini 3. The application includes an intelligent prompt enhancement system that:
- Optimizes simple prompts by adding visual details and photographic elements
- Summarizes and refines overly complex prompts for better results
- Adds aspect ratio-specific composition hints for better control
- Supports multiple aspect ratios and output resolutions

### Edit Tab
Modify existing images with AI-powered edits. Upload images via drag-and-drop or URL, then:
- Apply natural edits while maintaining photorealism
- Preserve overall composition and style consistency
- Generate seamless, professional-looking results
- Choose output resolution and aspect ratio

### Compose Tab
Combine multiple images into new, cohesive compositions. Upload several images and:
- Blend them together naturally and realistically
- Maintain consistent lighting and style across the composition
- Create seamless composites that look professional
- Control aspect ratio and resolution of output

## Core Features

- **Gemini 3 Integration**: Uses `gemini-3-pro-image-preview` for state-of-the-art image generation and editing
- **Intelligent Prompt Enhancement**: Automatic optimization of prompts before generation
- **Flexible Configuration**: Customizable aspect ratios and output resolutions
- **Multimodal Support**: Handles text-to-image, image-to-image, and multi-image composition
- **Modern UI**: Built with React 18, Shadcn/ui components, and Tailwind CSS
- **Drag-and-Drop Upload**: Intuitive file upload with visual feedback
- **Image Download**: Save generated and edited images with a single click
- **Dark Mode Support**: Theme switching for comfortable viewing
- **Docker Ready**: Fully containerized for easy deployment and scaling

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **Vite**: Lightning-fast build tool and dev server
- **Shadcn/ui**: High-quality, accessible React components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, consistent icon library
- **React Dropzone**: Drag-and-drop file upload handling
- **Sonner**: Toast notifications for user feedback

### Backend
- **FastAPI**: Modern, fast Python web framework
- **Google GenAI SDK**: Official SDK for Gemini API integration
- **HTTPx**: HTTP client with extended timeout support for long-running operations
- **Python 3**: Latest stable Python runtime

### Model
- **gemini-3-pro-image-preview**: Latest Gemini 3 model for image generation and editing

### DevOps
- **Docker**: Containerization with multi-stage builds
- **Docker Compose**: Container orchestration
- **Uvicorn**: ASGI server for FastAPI

## Prerequisites

Before you begin, ensure you have:

- **Docker & Docker Compose**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Google Gemini API Key**: Get one at [Google AI Studio](https://ai.studio/apps)
  - Navigate to "Get API key"
  - Create a new API key in Google Cloud
  - Copy the key for use in your environment

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GemFlash
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API key
# Use your favorite text editor and add your Google Gemini API key
```

**Important**: Never commit your `.env` file to version control. The `.gitignore` is already configured to exclude it.

#### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Your Google Gemini API key |
| `GEMINI_API_KEY` | Alternative | Alternative variable name for API key |
| `GEMINI_MODEL` | No | Model name (default: `gemini-3-pro-image-preview`) |
| `NODE_ENV` | No | Node environment (default: `development`) |
| `PORT` | No | Backend port (default: `8000`) |
| `NETWORK_NAME` | No | Docker network name (default: `shared_net`) |

Example `.env` file:

```env
# Google Gemini API Configuration
GOOGLE_API_KEY="your_actual_api_key_here"
GEMINI_MODEL="gemini-3-pro-image-preview"

# Application Configuration
NODE_ENV="development"
PORT=8000

# Network Configuration (for Docker)
NETWORK_NAME="shared_net"
```

### 3. Build the Application

```bash
# Build Docker images
docker compose build
```

### 4. Run the Application

```bash
# Start the application in the foreground
docker compose up

# Or run in the background
docker compose up -d
```

### 5. Access the Application

- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs (Swagger UI)

## Project Structure

```
GemFlash/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # React components (tabs, settings, etc.)
│   │   ├── App.jsx          # Main application component
│   │   ├── index.css        # Global styles
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── dist/                # Built frontend (generated after build)
│   ├── index.html           # HTML template
│   ├── package.json         # Dependencies
│   └── vite.config.js       # Vite configuration
│
├── backend/                  # FastAPI backend
│   ├── main.py              # FastAPI application and API endpoints
│   └── requirements.txt      # Python dependencies
│
├── .env.example              # Environment variables template
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Container orchestration
├── README.md                 # This file
├── ARCHITECTURE.md           # System architecture documentation
├── GOALS.md                  # Project goals and requirements
├── CONDUCTOR.md              # Security and operational guidelines
└── GEMINI.md                 # Gemini API integration details
```

## Configuration Options

### Aspect Ratios

The application supports the following aspect ratios:

| Ratio | Format | Use Case |
|-------|--------|----------|
| `1:1` | Square (1024×1024) | Profile pictures, social media tiles |
| `16:9` | Widescreen (1344×768) | Cinematic shots, landscape scenes |
| `9:16` | Portrait (768×1344) | Mobile content, portrait photography |
| `4:3` | Classic (1184×864) | Traditional photography |
| `3:4` | Portrait Classic (864×1184) | Vertical layouts |
| `4:5` | Instagram Portrait (896×1152) | Social media vertical |
| `5:4` | Landscape (1152×896) | Horizontal wide shots |
| `21:9` | Ultrawide (1536×672) | Cinematic ultra-wide |

### Output Resolutions

Choose from the following resolution options:

- **1K**: Standard quality, faster generation
- **2K**: High quality, balanced performance
- **4K**: Very high quality, detailed output
- **8K**: Maximum quality, longest generation time

## API Endpoints

### Generate Image

```http
POST /api/generate_image
Content-Type: application/json

{
  "prompt": "A serene landscape with mountains and a lake at sunset",
  "aspect_ratio": "16:9",
  "output_resolution": "2K",
  "output_format": "png"
}
```

### Edit Image

```http
POST /api/edit_image
Content-Type: multipart/form-data

- prompt: "Make the sky more vibrant blue"
- aspect_ratio: "1:1"
- output_resolution: "2K"
- output_format: "png"
- image_file: [binary image file]
- image_urls: "https://example.com/image.jpg" (optional)
```

### Compose Images

```http
POST /api/compose_images
Content-Type: multipart/form-data

- prompt: "Blend these images into a beautiful landscape"
- aspect_ratio: "16:9"
- output_resolution: "2K"
- output_format: "png"
- image_files: [multiple binary image files]
```

### Download Image

```http
GET /api/download_image/{base64_image_data}
```

### API Documentation

Full API documentation is available at `/api/docs` when the application is running.

## Development Workflow

### Local Development

```bash
# Start containers
docker compose up

# In another terminal, watch for changes
# The frontend will auto-reload via Vite HMR

# View logs
docker compose logs -f
```

### Backend Development

```bash
# The FastAPI backend includes automatic reload on file changes
# View backend logs
docker compose logs backend -f
```

### Frontend Development

```bash
# The Vite dev server provides hot module replacement
# Changes are reflected immediately in the browser
docker compose logs frontend -f
```

## Performance Notes

### Timeout Configuration

The application is configured with extended timeouts to handle long-running image generation:

- **Read Timeout**: 120 seconds (allows for complex image generation)
- **Connect Timeout**: 60 seconds (for API connection establishment)

This ensures that large image generation requests won't timeout prematurely.

### Image Generation Time

Generation time varies based on:
- Prompt complexity
- Output resolution (1K vs 8K)
- System resources
- Gemini API load

Typical generation times:
- Simple prompts at 1K: 10-20 seconds
- Complex prompts at 2K: 20-40 seconds
- Detailed prompts at 4K: 30-60 seconds

## Security

This project follows enterprise security best practices:

- **No API Keys in Repository**: Use `.env` files (excluded via `.gitignore`)
- **Container Security**: Non-root user execution, minimal base images
- **HTTPS**: All external communications use HTTPS
- **Ephemeral Data**: No persistent storage of sensitive data
- **Input Validation**: All user inputs are validated before processing

For detailed security guidelines, see [CONDUCTOR.md](./CONDUCTOR.md).

## Troubleshooting

### Common Issues

#### Application won't start

```bash
# Check if ports are already in use
lsof -i :8000
docker compose ps
```

#### API key not recognized

1. Verify `.env` file is in the project root
2. Check that `GOOGLE_API_KEY` is set correctly
3. Ensure the API key has image generation permissions
4. Restart containers after updating `.env`: `docker compose restart`

#### Image generation timeout

1. Increase the timeout values in `backend/main.py`
2. Check Google Gemini API status
3. Try with simpler prompts or lower resolutions

#### Port conflicts

```bash
# Change the port in docker-compose.yml or .env
PORT=8001 docker compose up
```

### Logs and Debugging

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend

# Follow logs in real-time
docker compose logs -f

# View logs for a specific timeframe
docker compose logs --since 10m
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[GOALS.md](./GOALS.md)** - Project requirements and objectives
- **[CONDUCTOR.md](./CONDUCTOR.md)** - Security and operational guidelines
- **[GEMINI.md](./GEMINI.md)** - Detailed Gemini API integration documentation

## Deployment

### Docker Compose (Development & Production)

```bash
# Build and start
docker compose up -d

# Stop services
docker compose down

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d
```

### Behind Nginx Proxy Manager

The application is designed to run behind Nginx Proxy Manager on a Docker network called `shared_net`. Update `docker-compose.yml`:

```yaml
networks:
  default:
    name: shared_net
    external: true
```

See [CONDUCTOR.md](./CONDUCTOR.md) for production deployment guidelines.

## Contributing

When contributing to GemFlash:

1. Follow the existing code style and patterns
2. Test your changes with all three tabs (Generate, Edit, Compose)
3. Update documentation as needed
4. Never commit API keys or sensitive data
5. Use descriptive commit messages

## Support

For issues, questions, or suggestions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing documentation files
3. Check Google Gemini API status and documentation
4. Review application logs with `docker compose logs`

## License

This project is developed following enterprise security standards and is intended for internal use as specified in the security documentation.

## Changelog

### Recent Updates

- **Gemini 3 Migration**: Upgraded from Gemini 2.5 Flash to `gemini-3-pro-image-preview`
- **Timeout Configuration**: Extended read timeout to 120 seconds for long-running generation
- **Edit Tab UI**: Improved layout with better image preview and settings organization
- **Compose Tab**: Added support for multi-image composition
- **Prompt Enhancement**: Intelligent system that optimizes prompts before generation

### Version History

- **v1.0.0** - Initial release with Generate, Edit, and Compose tabs
- **v0.9.0** - Beta release with Gemini 3 support
