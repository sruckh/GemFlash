# GemFlash Project Summary

## Purpose
Containerized web application for AI image generation and editing using Google Gemini image models.

## Technology Stack
- **Frontend:** React, Tailwind CSS, shadcn/ui, Vite
- **Backend:** Python, FastAPI, Uvicorn, Gunicorn
- **AI:** Google GenAI SDK (`google-genai` Python package)
- **Containerization:** Docker, Docker Compose

## Current Model Configuration
- **Default Model**: `gemini-3.1-flash-image` (Nano Banana 2)
- **Available Models** (set via `GEMINI_MODEL` env var):
  - `gemini-3.1-flash-image` — Nano Banana 2 (default)
  - `gemini-3-pro-image` — Nano Banana Pro
  - `gemini-flash-latest` — Gemini Flash
- **API Key**: `GOOGLE_API_KEY` or `GEMINI_API_KEY` env var

## Project Structure
- `backend/main.py` — FastAPI server, all API endpoints
- `frontend/src/App.jsx` — Main React application (single-file)
- `frontend/src/components/` — Reusable components (EnhancedImageCard, AIParameterControls, etc.)
- `frontend/vite.config.js` — Vite config with `@` path alias
- `Dockerfile` — Multi-stage production build
- `docker-compose.yml` — Local development

## Features
- **Generate Tab**: Text-to-image generation with prompt enhancement
- **Edit Tab**: Upload image + prompt for AI editing
- **Compose Tab**: Combine multiple images into new compositions
- **Image Reuse**: Send images between tabs (Edit → Compose → Edit)
- **Aspect Ratios**: 10 supported ratios (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9)

## How to Run
1. Add `GOOGLE_API_KEY` to `.env` file
2. `docker compose build`
3. `docker compose up`

## Key Files
- `CLAUDE.md` — Claude Code configuration
- `CONDUCTOR.md` — Security policies
- `GEMINI.md` — Gemini API integration docs
- `.serena/project.yml` — Serena project config
