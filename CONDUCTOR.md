# Conductor: Security, Compliance, and Operations for GemFlash

This document is the authoritative source for security policy, architecture, and operational practices for the **GemFlash** project. All team members are expected to be familiar with its contents.

## 1. Project Overview

*   **Name**: GemFlash
*   **Description**: A containerized web application that uses the Google Gemini 2.5 Flash Image API to generate and edit images.
*   **Primary Language/Stack**: React (JavaScript), Python (FastAPI assumed), Docker.
*   **Source Control**: [e.g., git@github.com:example-org/gemflash.git]

## 2. Guiding Principles

*   **Secure by Design**: Security is a primary consideration in all architectural and development decisions.
*   **Defense in Depth**: We layer multiple security controls to protect our assets.
*   **Least Privilege**: Components, users, and services are granted only the minimum level of access required to perform their function.
*   **Assume Breach**: We operate under the assumption that systems may be compromised and design our monitoring and response capabilities accordingly.

## 3. Security Architecture

Refer to `ARCHITECTURE.md` for a detailed system diagram and data flow.

### 3.1. Authentication and Authorization

*   **User Authentication**: The application is designed for internal use and will be placed behind the Nginx Proxy Manager, which will handle access control. There is no built-in user authentication system.
*   **Service-to-Service Authentication**: The backend authenticates with the Google Gemini API using the `GOOGLE_API_KEY`.

### 3.2. Data Security

*   **Data Classification**:
    *   **User-Uploaded Images**: Treated as sensitive user data. Handled ephemerally and not stored long-term.
    *   **AI-Generated Images**: Treated as application data.
*   **Encryption in Transit**: All network communication (user to app, app to Google API) must use TLS 1.2 or higher.
*   **Encryption at Rest**: This application is designed to be stateless and does not have a persistent data store.

## 4. Secure Development Lifecycle (SDL)

### 4.1. Dependency Management

*   **Vulnerability Scanning**:
    *   **Frontend**: `npm audit` will be used to scan for vulnerabilities in JavaScript packages.
    *   **Backend**: `pip-audit` will be used to scan for vulnerabilities in Python packages.
*   **Approved Dependencies**: Only well-maintained libraries from trusted sources are permitted.
*   **Version Pinning**: All dependencies in `package.json` and `requirements.txt` must be pinned to specific, audited versions.

### 4.2. Container Security

*   **Base Image**: The Docker container is built from an approved, minimal base image (e.g., `python:3.11-slim`).
*   **Image Scanning**: The final Docker image is scanned for vulnerabilities using a tool like Trivy or Clair as part of the CI pipeline.
*   **Non-Root User**: The application runs as a non-root user inside the container.
*   **Immutable Infrastructure**: Containers are treated as immutable. No changes are made to running containers; instead, a new image is built and deployed.

## 5. Logging and Monitoring

*   **Centralized Logging**: All application and system logs are shipped to a centralized logging platform (e.g., ELK Stack, Splunk, Datadog).
*   **Audit Trails**: Log all interactions with the Google Gemini API, including prompts (if permissible) and metadata.
*   **Metrics & Alerting**: Key security and performance metrics are collected. Alerts are configured for security events, high error rates, and performance degradation.

## 6. Incident Response

*   **On-Call**: The on-call rotation is managed via [e.g., PagerDuty, Opsgenie].
*   **Playbooks**: Pre-defined playbooks exist for common security incidents, such as API key compromise or detection of malicious image uploads.
*   **Contact**: In case of a security incident, notify `#security-incidents` on Slack immediately.