# AI Safety Gateway

A production-ready, scalable system for scanning text submissions to detect compliance risks, PII, and policy violations. Built with Go, PostgreSQL, Redis, and Next.js.

## Overview

The Compliance Scanner is a distributed system designed to process large volumes of text submissions for compliance and security risks. It features:

- **PII Detection**: Social Security Numbers, credit card numbers, phone numbers, emails
- **Compliance Violations**: Sensitive keywords, prohibited content patterns
- **Policy Violations**: Company policy breaches, restricted language
- **Risk Assessment**: Risk scoring and categorization
- **Async Processing**: Submit text, get job ID, poll for results
- **Scalable Architecture**: Distributed worker pool with Redis task queuing
- **Persistent Storage**: PostgreSQL audit trail of all scan results
- **Web UI**: Interactive frontend for testing and management

## Architecture

```
User Submission (Frontend) 
    ↓
API Gateway (Port 8080)
    ↓
Redis Queue
    ↓
Worker Pool (Multiple Instances)
    ↓
Compliance Engine
    ↓
PostgreSQL Database
    ↓
Results Returned to Frontend
```

### Components

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| Frontend | Next.js + React + TypeScript | 3000 | User interface for submissions |
| API Service | Go + Gin | 8080 | REST API for scan submissions & status |
| Worker Service | Go | Internal | Processes compliance checks from queue |
| Database | PostgreSQL | 5432 | Persistent job storage & results |
| Cache & Queue | Redis | 6379 | Task queuing & caching |

## Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR Node.js 18+ and Go 1.21+ for manual setup

### Option 1: Docker Compose (Recommended)

```bash
# Start entire stack
docker-compose up --build

```

Environment variables are defined in `.env` (create if needed):

```env
# Database
DB_USER=compliance_user
DB_PASSWORD=securepassword
DB_NAME=compliance_db

# API
API_PORT=8080

# Redis
REDIS_ADDR=redis:6379
REDIS_PORT=6379

# Database connection URL
DB_URL=postgres://compliance_user:securepassword@db:5432/compliance_db
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API endpoint
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Project Structure

```
compliance-scanner/
├── backend/                          # Go backend services
│   ├── services/
│   │   ├── api/                     # REST API service
│   │   │   ├── cmd/main.go          # Entry point
│   │   │   ├── internal/
│   │   │   │   ├── handlers/        # HTTP request handlers
│   │   │   │   ├── middleware/      # Request ID, CORS, etc
│   │   │   │   ├── config/          # Dependency injection
│   │   │   │   ├── models/          # Data models
│   │   │   │   ├── db/              # Database layer
│   │   │   │   └── queue/           # Redis client
│   │   │   └── Dockerfile
│   │   └── worker/                  # Background worker service
│   │       ├── cmd/main.go
│   │       ├── internal/
│   │       │   └── compliance/      # Compliance checking logic
│   │       └── Dockerfile
│   ├── packages/shared/             # Shared Go packages
│   ├── infra/
│   │   ├── sql/init.sql            # Database initialization
│   │   ├── docker/                 # Docker configurations
│   │   └── k8s/                    # Kubernetes manifests (optional)
│   ├── docker-compose.yml          # Local development stack
│   ├── docker-compose.frontend.yml # Optional: include frontend
│   ├── go.work                      # Go workspace configuration
│   └── README.md
├── frontend/                        # Next.js frontend
│   ├── pages/                       # Next.js pages & routing
│   ├── components/                  # React components
│   ├── lib/                         # Utilities & API client
│   ├── styles/                      # CSS & Tailwind config
│   ├── public/                      # Static assets
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── README.md
│   └── SETUP.md
└── README.md (this file)
```

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "compliance-scanner-api"
}
```

### Submit Text for Scanning
```bash
POST /scan
Content-Type: application/json

{
  "input_text": "Your text to scan for compliance risks..."
}
```

Response:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "request_id": "req-123-456-789"
}
```

### Get Scan Results
```bash
GET /scan/:job_id
```

Response (while processing):
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "created_at": "2026-05-04T10:30:00Z"
}
```

Response (completed):
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result": {
    "risk_level": "high",
    "pii_detected": ["email", "phone_number"],
    "violations": ["sensitive_keyword", "policy_breach"],
    "score": 85
  },
  "completed_at": "2026-05-04T10:30:05Z"
}
```

## Development

### Building Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api
docker-compose build worker
```

### Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service
docker-compose logs -f api
docker-compose logs -f worker
```

### Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database
DB_USER=compliance_user
DB_PASSWORD=your_secure_password
DB_NAME=compliance_db
DB_PORT=5432

# Redis
REDIS_ADDR=redis:6379
REDIS_PORT=6379

# API
API_PORT=8080

# Connection string (auto-constructed if using above)
DB_URL=postgres://compliance_user:your_secure_password@db:5432/compliance_db
```
```

## Adding Compliance Rules

Compliance rules are defined in the worker service. To add new detection rules:

1. Update `backend/services/worker/internal/compliance/checker.go`
2. Add new detection functions and rule definitions
3. Rebuild the worker service: `docker-compose build worker`
4. Restart: `docker-compose up -d worker`

---


**Last Updated**: May 5, 2026
