# Building, Testing, and Deploying GemFlash

This document describes the standard process for building and deploying the GemFlash application.

## 1. Prerequisites

*   Docker
*   Docker Compose

## 2. Local Development

1.  **Environment**: Create a `.gemini/.env` file and add the `GOOGLE_API_KEY`.
2.  **Build**: Build the Docker image using Docker Compose. This will also generate the `favicon.ico` file.
    ```bash
    docker-compose build
    ```
3.  **Run**: Start the service using Docker Compose.
    ```bash
    docker-compose up
    ```

## 3. CI/CD Pipeline (Production Build)

The CI/CD pipeline automates all steps upon a merge to the `main` branch.

### Step 1: Lint & Static Analysis

*   **Frontend**:
    ```bash
    docker-compose run --rm gemflash npm run lint
    ```
*   **Backend**:
    ```bash
    docker-compose run --rm gemflash ruff check .
    docker-compose run --rm gemflash bandit -r .
    ```

### Step 2: Unit & Integration Tests

*   **Frontend**:
    ```bash
    docker-compose run --rm gemflash npm test
    ```
*   **Backend**:
    ```bash
    docker-compose run --rm gemflash pytest
    ```

### Step 3: Security Scanning

*   **Frontend**:
    ```bash
    docker-compose run --rm gemflash npm audit
    ```
*   **Backend**:
    ```bash
    docker-compose run --rm gemflash pip-audit
    ```

### Step 4: Build and Push Production Image

The `Dockerfile` is already configured to build a production-ready image. The CI/CD pipeline will build the image, tag it, and push it to the container registry.

### Step 5: Deploy

The new image is deployed to the target environment.