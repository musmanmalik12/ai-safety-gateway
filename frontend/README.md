# Compliance Scanner Frontend

Production-grade Next.js frontend for the Compliance & Risk Scanner system.

## Features

- **Modern Tech Stack**: Built with Next.js 14, React 18, TypeScript
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **Enterprise UI**: Professional design with gradient headers and card layouts
- **Real-time Polling**: Live scan status updates with 1-second intervals
- **Type Safety**: Full TypeScript support for API contracts
- **Production Ready**: Optimized for performance and user experience

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

```bash
cd frontend
npm install
```

## Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

For production:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Development

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── pages/              # Next.js pages (index.tsx, _app.tsx, _document.tsx)
├── components/         # React components (ScannerComponent.tsx)
├── lib/               # Utilities and API client
├── styles/            # Global CSS with Tailwind
├── public/            # Static assets (favicon, icons)
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

## Key Components

### ScannerComponent

Main UI component featuring:
- Text input with sample data loaders
- Real-time scan status monitoring
- Comprehensive results display
  - Risk level badge
  - Risk score visualization (0-100)
  - Decision indicator (ALLOW/FLAG/BLOCK)
  - Detected categories
  - Compliance assessment
  - Detected entities list
  - Reasoning breakdown
- System health status in header

### API Client (`lib/api.ts`)

Handles all communication with the Go backend:
- `submitScan()` - Submit text for analysis
- `getScanStatus()` - Poll for results
- `checkHealth()` - Verify system status

## Routes

- `/` - Main scanner interface (no `/demo` route naming)

## Styling

Uses Tailwind CSS with:
- Blue gradient theme (#1e40af primary)
- Green for LOW/ALLOW risk
- Yellow for MEDIUM/FLAG risk  
- Red for HIGH/BLOCK risk
- Custom component utilities in `globals.css`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Image optimization via Next.js
- Code splitting and lazy loading
- CSS minification via Tailwind
- No unused dependencies

## Troubleshooting

### API Connection Error
- Ensure backend is running on configured port (default: 8080)
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS headers on backend

### Build Errors
- Clear `.next/` directory: `rm -rf .next/`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

## License

Part of the Compliance Scanner project
