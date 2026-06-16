# GemFlash - AI Image Generation & Editing

A modern web application for AI-powered image generation, editing, and composition. Supports two AI providers — **Nano Banana 2** (Google Gemini) and **GPT Image 2** (via Fal.AI) — switchable via a global toggle in the header.

## Features

### Provider Selection
Switch between AI providers at any time using the header toggle:
- **Nano Banana 2** — Google's `gemini-3.1-flash-image`, fast and high-quality
- **GPT Image 2** — OpenAI's latest image model served through Fal.AI, with jpeg/png/webp output format control

### Generate Tab
Create images from text prompts:
- Supports 10 aspect ratios and 3 output resolutions (1K / 2K / 4K)
- Prompts passed directly to the API for strict adherence to user input
- Output format selection (jpeg/png/webp) available with GPT Image 2

### Edit Tab
Modify existing images with AI-powered edits. Upload via drag-and-drop, URL, or send from another tab:
- Apply natural edits while maintaining photorealism
- Works with both uploaded files and previously generated images (URL or base64)
- Output resolution, aspect ratio, and format (GPT Image 2) configurable

### Compose Tab
Combine multiple images into new, cohesive compositions:
- Select up to 5 images from the pool
- Nano Banana: passes images as multimodal input to Gemini
- GPT Image 2: uploads images to Fal.AI storage and calls the edit endpoint with multiple image URLs
- Control aspect ratio, resolution, and output format

## Core Features

- **Dual AI Provider Support**: Switch between Nano Banana 2 and GPT Image 2 globally
- **Flexible Resolution**: 1K, 2K, 4K output for both providers
- **Output Format Control**: jpeg / png / webp (GPT Image 2 only; Gemini auto-selects format)
- **Image Reuse**: Send generated images between tabs — handles both base64 (Nano Banana) and hosted URLs (Fal.AI)
- **Strict Prompt Adherence**: User prompts passed directly to the API without modification
- **Modern UI**: React 18, shadcn/ui components, Tailwind CSS, dark mode support
- **Drag-and-Drop Upload**: Intuitive file upload with visual feedback
- **Docker Ready**: Fully containerized, runs behind Nginx Proxy Manager

## Technology Stack

### Frontend
- **React 18** with hooks
- **Vite** — build tool and dev server
- **shadcn/ui** — accessible React components
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icon library
- **React Dropzone** — drag-and-drop uploads

### Backend
- **FastAPI** — Python web framework
- **Google GenAI SDK** (`google-genai`) — Nano Banana / Gemini API
- **HTTPx** — async HTTP client for Fal.AI REST API calls
- **Python 3**

### AI Models
| Provider | Model ID | Used For |
|----------|----------|----------|
| Nano Banana 2 | `gemini-3.1-flash-image` | Default Gemini model |
| Nano Banana Pro | `gemini-3-pro-image` | Higher quality Gemini |
| GPT Image 2 | `openai/gpt-image-2` (via Fal.AI) | OpenAI model via Fal.AI |

### DevOps
- **Docker** with multi-stage builds
- **Docker Compose** + external `shared_net` network
- **Uvicorn / Gunicorn** — ASGI server

## Prerequisites

- **Docker & Docker Compose**
- **Google Gemini API Key** — [Google AI Studio](https://aistudio.google.com/)
- **Fal.AI API Key** — [fal.ai](https://fal.ai/) (required only for GPT Image 2)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GemFlash
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in your API keys
```

#### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key for Nano Banana |
| `GEMINI_API_KEY` | Alternative | Alternative name for Google API key |
| `GEMINI_MODEL` | No | Gemini model ID (default: `gemini-3.1-flash-image`) |
| `FAL_KEY` | For GPT Image 2 | Fal.AI API key |
| `NODE_ENV` | No | Node environment (default: `development`) |
| `PORT` | No | Backend port (default: `8000`) |
| `NETWORK_NAME` | No | Docker network name (default: `shared_net`) |

Example `.env`:

```env
# Google Gemini API (Nano Banana)
GOOGLE_API_KEY="your_google_api_key_here"
GEMINI_MODEL="gemini-3.1-flash-image"

# Fal.AI (GPT Image 2)
FAL_KEY="your_fal_api_key_here"

# Application
NODE_ENV="development"
PORT=8000
NETWORK_NAME="shared_net"
```

### 3. Build and Run

```bash
docker compose up --build -d
```

### 4. Access the Application

- **Web Interface**: http://localhost:8000 (or your configured domain via Nginx Proxy Manager)
- **API Docs**: http://localhost:8000/api/docs

## Project Structure

```
GemFlash/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── App.jsx           # Main application (provider state, all tab logic)
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── dist/                 # Built assets (generated inside Docker)
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py               # FastAPI app — Nano Banana + Fal.AI endpoints
│   └── requirements.txt
│
├── .env                      # Your local environment variables (not in git)
├── .env.example              # Template
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Configuration Options

### Aspect Ratios

| Ratio | Format | Use Case |
|-------|--------|----------|
| `1:1` | Square | Profile pictures, social media tiles |
| `2:3` | Portrait | Photography, print/poster |
| `3:2` | Landscape | Photography |
| `3:4` | Portrait Classic | Social media, print |
| `4:3` | Classic | Traditional photography |
| `4:5` | Instagram Portrait | Social media vertical |
| `5:4` | Landscape | Horizontal wide shots |
| `9:16` | Vertical | Mobile video (Reels/Shorts) |
| `16:9` | Widescreen | Video, web |
| `21:9` | Ultrawide | Cinematic |

### Output Resolutions

| Label | Nano Banana (1:1 example) | GPT Image 2 (1:1 example) |
|-------|---------------------------|---------------------------|
| **1K** | 1024×1024 | 1024×1024 |
| **2K** | 2048×2048 | 2048×2048 |
| **4K** | 4096×4096 | 2880×2880 (8.29M px ceiling) |

> GPT Image 2 via Fal.AI has a maximum of 8,294,400 total pixels and a 3840 px max edge, so 4K square is capped at 2880×2880. Widescreen (16:9) at 4K = 3840×2160.

### Output Formats (GPT Image 2 only)

- **PNG** — Lossless (default)
- **JPEG** — Compressed, smaller file size
- **WebP** — Modern format, good compression

Nano Banana's output format is determined automatically by the Gemini API.

## API Endpoints

### Nano Banana (Google Gemini)

```http
POST /api/generate_image
Content-Type: application/json
{ "prompt": "...", "aspect_ratio": "16:9", "output_resolution": "2K", "output_format": "png" }

POST /api/edit_image          (multipart/form-data)
POST /api/compose_images      (multipart/form-data)
```

### GPT Image 2 (Fal.AI)

```http
POST /api/fal/generate_image
Content-Type: application/json
{ "prompt": "...", "aspect_ratio": "16:9", "output_resolution": "2K", "output_format": "png" }

POST /api/fal/edit_image      (multipart/form-data — accepts image_url or image_file)
POST /api/fal/compose_images  (multipart/form-data — accepts image_urls JSON array + image_files)
```

Fal.AI responses return `image_url` (hosted CDN URL). Nano Banana responses return `image` (base64) + `mime_type`.

## Performance Notes

- **Timeouts**: 120s read / 60s connect for both providers
- **Image uploads to Fal.AI**: Base64 images and file uploads are automatically uploaded to Fal.AI storage before being passed to the edit/compose API
- **URL images**: Images generated by GPT Image 2 are passed directly by URL to subsequent edit/compose calls — no re-upload needed

### Typical Generation Times

| Provider | Resolution | Approximate Time |
|----------|-----------|-----------------|
| Nano Banana 2 | 1K | 10–20 s |
| Nano Banana 2 | 2K | 20–40 s |
| Nano Banana 2 | 4K | 30–60 s |
| GPT Image 2 | 1K–4K | 15–45 s |

## Security

- API keys stored in `.env` (excluded via `.gitignore`)
- Keys read server-side only — never exposed to the browser
- All external API calls made from the backend container

See [CONDUCTOR.md](./CONDUCTOR.md) for full security guidelines.

## Troubleshooting

### Container won't start
```bash
docker compose logs
docker compose ps
```

### API key errors
1. Verify `.env` is in the project root with correct values
2. Restart after editing `.env`: `docker compose restart`

### GPT Image 2 returns error
1. Confirm `FAL_KEY` is set in `.env`
2. Check Fal.AI account has credits
3. Check logs: `docker compose logs -f`

### Image generation timeout
1. Try a lower resolution first
2. Check provider API status
3. Timeout values are set in `backend/main.py` (`httpx.Timeout(120.0, connect=60.0)`)

### Logs and Debugging
```bash
docker compose logs -f           # Follow all logs
docker compose logs --since 10m  # Last 10 minutes
```

## Deployment

### Behind Nginx Proxy Manager
The app is designed for the external `shared_net` Docker network. The `docker-compose.yml` uses that network with no exposed ports — Nginx Proxy Manager handles ingress.

```bash
docker compose up --build -d     # Build and start
docker compose down              # Stop
docker compose up --build -d     # Rebuild after code changes
```

## Changelog

### Latest
- **Fal.AI / GPT Image 2 integration**: Added global provider toggle; new `/api/fal/*` endpoints; image size computation for Fal.AI constraints; automatic Fal.AI storage upload for edit/compose
- **Output format**: jpeg/png/webp selector added for GPT Image 2 provider
- **Resolution**: 1K/2K/4K exposed in UI for both providers
- **Mime type fix**: Nano Banana responses now return actual `mime_type` from Gemini instead of hardcoding `image/png`
- **Cross-tab transfer**: URL-based images (Fal.AI) handled correctly without CORS-prone blob conversion

### Previous
- **Gemini Model Refresh**: Updated to Nano Banana 2 `gemini-3.1-flash-image`
- **Strict Prompt Adherence**: Disabled prompt enhancement
- **Timeout Configuration**: Extended read timeout to 120 s
- **Path Alias Fix**: Resolved jsconfig.json/vite.config.js `@` alias inconsistency
