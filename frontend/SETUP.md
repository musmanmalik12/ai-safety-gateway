# Frontend Setup Guide

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `localhost:8080`

### Installation & Run

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Production Build

```bash
cd frontend

# Build for production
npm run build

# Start production server
npm start
```

## Docker Setup

### Option 1: Standalone Frontend Container

```bash
cd frontend
docker build -t compliance-scanner-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  compliance-scanner-frontend
```

### Option 2: Full Stack with Docker Compose

```bash
# Start entire stack (backend + frontend)
docker-compose up --build

# Or with frontend compose file
docker-compose -f docker-compose.yml -f docker-compose.frontend.yml up --build
```

## Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:8080

# Production
# NEXT_PUBLIC_API_URL=https://api.compliance-scanner.com
```

### Available Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (must be public, hence `NEXT_PUBLIC_` prefix)

## Development Workflow

### File Structure
```
frontend/
├── pages/              # Next.js pages & routing
├── components/         # React components
├── lib/               # Utilities (API client, helpers)
├── styles/            # Global CSS & Tailwind config
├── public/            # Static assets & favicon
├── .env.local         # Environment variables (git-ignored)
└── next.config.js     # Next.js config
```

### Hot Reload
The development server automatically reloads when you save files:
```bash
npm run dev
```

### Type Checking
```bash
# Check TypeScript errors
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## API Integration

The frontend communicates with the backend via `/scan` endpoint:

### Example API Calls

```typescript
// Submit scan
POST http://localhost:8080/scan
{
  "input_text": "Your text here"
}

// Get scan status
GET http://localhost:8080/scan/{job_id}
```

See `lib/api.ts` for the complete API client.

## Troubleshooting

### Frontend runs but shows "System offline"

**Issue**: Backend API not reachable

**Solution**:
1. Check backend is running: `docker-compose ps`
2. Verify API URL in `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8080`
3. Check API CORS headers allow frontend origin
4. For Docker: Use `http://api:8080` instead of `localhost:8080`

### Build errors

**Clear cache and reinstall**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001
```

### TypeScript errors

```bash
# Regenerate types
rm -rf .next
npm run build
```

## Performance Tips

### Production Optimizations
- Next.js automatically optimizes images
- Code splitting happens per route
- CSS is minified via Tailwind
- JavaScript is bundled efficiently

### Browser DevTools
1. Open DevTools (F12)
2. Check Network tab for request timing
3. Check Console for errors
4. Use Lighthouse for performance audit

## CORS Configuration

If running frontend and backend on different ports locally:

**Backend (Go API)** should allow CORS:

```go
c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
```

## Deployment

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Self-hosted (Docker)
```bash
# Build and push image
docker build -t my-registry/compliance-scanner-frontend:latest .
docker push my-registry/compliance-scanner-frontend:latest

# Deploy via Kubernetes, ECS, etc.
```

### Environment Variables in Production
Set these before deploying:
```env
NEXT_PUBLIC_API_URL=https://api.compliance-scanner.com
```

## Support

For issues or questions:
1. Check error messages in browser console
2. Review `lib/api.ts` for API integration
3. Verify backend is running and accessible
4. Check `.env.local` configuration
