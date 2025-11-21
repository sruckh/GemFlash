FROM node:20-slim AS frontend_builder

WORKDIR /app

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 3: Backend
FROM python:3.11-slim

WORKDIR /app

RUN useradd --create-home appuser

USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create frontend public directory structure
RUN mkdir -p /app/frontend/public
RUN chown -R appuser:appuser /app

USER appuser

ENV PATH="/home/appuser/.local/bin:${PATH}"


# Copy built React frontend
COPY --from=frontend_builder /app/dist /app/frontend/dist

# Copy frontend public assets
COPY frontend/public /app/frontend/public

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["/home/appuser/.local/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
