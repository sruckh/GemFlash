# GemFlash Project Summary

## Purpose
Containerized web application for AI image generation and editing supporting two AI providers: Google Gemini (Nano Banana 2) and OpenAI GPT Image 2 via Fal.AI.

## Technology Stack
- **Frontend:** React, Tailwind CSS, shadcn/ui, Vite
- **Backend:** Python, FastAPI, Uvicorn, Gunicorn
- **AI (Provider 1):** Google GenAI SDK (`google-genai` Python package) → Nano Banana 2
- **AI (Provider 2):** Fal.AI REST API via httpx → GPT Image 2
- **Containerization:** Docker, Docker Compose

## Provider System
Global toggle in the header switches between:
- **Nano Banana 2** (`gemini-3.1-flash-image`) — via Google API directly
- **GPT Image 2** (`openai/gpt-image-2`) — via Fal.AI platform

## Current Model Configuration
- **Nano Banana Default**: `gemini-3.1-flash-image` (set via `GEMINI_MODEL` env var)
- **Available Nano Banana Models**:
  - `gemini-3.1-flash-image` — Nano Banana 2 (default)
  - `gemini-3-pro-image` — Nano Banana Pro
  - `gemini-flash-latest` — Gemini Flash
- **Nano Banana API Key**: `GOOGLE_API_KEY` or `GEMINI_API_KEY` env var
- **Fal.AI API Key**: `FAL_KEY` env var

## Project Structure
- `backend/main.py` — FastAPI server, all API endpoints (Nano Banana + Fal.AI)
- `frontend/src/App.jsx` — Main React application (single-file)
- `frontend/src/components/` — Reusable components (EnhancedImageCard, AIParameterControls, etc.)
- `frontend/vite.config.js` — Vite config with `@` path alias
- `Dockerfile` — Multi-stage production build
- `docker-compose.yml` — Local development

## Features
- **Provider toggle**: Nano Banana 2 vs GPT Image 2, globally selectable in header
- **Generate Tab**: Text-to-image generation
- **Edit Tab**: Upload image + prompt for AI editing
- **Compose Tab**: Combine multiple images (Fal.AI uses edit endpoint with multiple image_urls)
- **Image Reuse**: Send images between tabs (works for both base64 and URL images)
- **Aspect Ratios**: 10 supported ratios (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9)
- **Resolution**: 1K / 2K / 4K for both providers
- **Output Format**: jpeg/png/webp — only available for Fal.AI (Gemini auto-selects)

## API Endpoints
- `POST /api/generate_image` — Nano Banana generate
- `POST /api/edit_image` — Nano Banana edit
- `POST /api/compose_images` — Nano Banana compose
- `POST /api/fal/generate_image` — GPT Image 2 generate
- `POST /api/fal/edit_image` — GPT Image 2 edit
- `POST /api/fal/compose_images` — GPT Image 2 compose (uses edit endpoint with multiple URLs)

## How to Run
1. Add `GOOGLE_API_KEY` and `FAL_KEY` to `.env` file
2. `docker compose up --build -d`

## Key Files
- `CLAUDE.md` — Claude Code configuration
- `CONDUCTOR.md` — Security policies
- `GEMINI.md` — Gemini API integration docs
- `.serena/project.yml` — Serena project config
