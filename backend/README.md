# Compliance & Risk Text Scanner System

Scan user-submitted text for compliance risks, PII, or policy violations using a distributed, scalable architecture.

## Overview

A production-ready compliance scanning system built with Go that processes text submissions to detect:
- **PII Detection**: Social Security Numbers, credit card numbers, phone numbers, emails
- **Compliance Violations**: Sensitive keywords, prohibited content patterns
- **Policy Violations**: Company policy breaches, restricted language
- **Risk Assessment**: Risk scoring and categorization

Built with:
- **Go** for high-performance processing
- **PostgreSQL** for persistent job storage
- **Redis** for task queuing and async processing
- **Docker** for containerized deployment
- **Gin** framework for REST API

## Architecture

```
User Submission → API Gateway → Queue (Redis) → Worker Pool → Compliance Engine → Results
```

## Features

- **Async Processing**: Submit text, get job ID, poll for results
- **Scalable**: Distributed worker architecture with Redis queue
- **Persistent**: PostgreSQL stores all scan results for audit trail
- **Request Tracking**: Unique request IDs for correlation across logs
- **Web UI**: Interactive demo interface for testing

## API Endpoints

### Submit Text for Scanning
```bash
POST /scan
Content-Type: application/json

{
  "input_text": "Your text to scan for compliance risks..."
}

Response:
{
  "job_id": "uuid-string",
  "status": "queued",
  "request_id": "request-uuid"
}
```

### Check Scan Results
```bash
GET /scan/:id

Response:
{
  "id": "job-id",
  "status": "completed|processing|pending",
  "input_text": "...",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:05Z"
}
```

### Demo Interface
```bash
GET /demo
```
Interactive web UI for testing the compliance scanner

## Run locally

```bash
docker-compose up --build