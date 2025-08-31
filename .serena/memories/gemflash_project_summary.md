This memory documents the setup and development of the GemFlash project.

**Project Goal:** To create a containerized web application for AI image generation and editing using the Google Gemini 2.5 Flash Image API.

**Technology Stack:**
*   **Frontend:** React, Tailwind CSS, shadcn/ui, Vite
*   **Backend:** Python, FastAPI, Uvicorn, Gunicorn
*   **Containerization:** Docker, Docker Compose

**Key Implementation Steps:**

1.  **Documentation:**
    *   Created and updated `CONDUCTOR.md` for security policies.
    *   Created `GEMINI.md` to document the Google Gemini API integration.
    *   Updated `ARCHITECTURE.md` with a system diagram and data flow.
    *   Updated `BUILD.md` with build and deployment instructions.
    *   Maintained a development log in `JOURNAL.md`.
    *   Created a `README.md` with final instructions.

2.  **Project Structure:**
    *   Set up a monorepo-style structure with separate `frontend` and `backend` directories.
    *   Configured `Dockerfile` for a multi-stage build to create a production-ready image.
    *   Created `docker-compose.yml` for easy local development.

3.  **Features:**
    *   **Favicon Generation:** The `Dockerfile` automatically generates a `favicon.ico` from a source image using ImageMagick.
    *   **Image Generation:** Users can enter a text prompt to generate an image.
    *   **Image Editing:** Users can upload an image and provide a prompt to edit it.
    *   **API Integration:** The backend securely communicates with the Google Gemini API using an API key managed through an environment file.

**How to Run:**
1.  Add the `GOOGLE_API_KEY` to the `.gemini/.env` file.
2.  Build the application with `docker-compose build`.
3.  Run the application with `docker-compose up`.
