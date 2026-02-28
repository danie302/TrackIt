# TrackIt Frontend

React + TypeScript + Vite frontend application for the TrackIt inventory management system.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite  
- **Language**: TypeScript
- **UI Library**: Material UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Management**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The development server will start on `http://localhost:5173`

## Project Structure

```
src/
├── api/          # API client and endpoints
├── assets/       # Static assets
├── components/   # Reusable UI components
├── pages/        # Page components (routes)
├── services/     # Business logic services
├── stores/       # Zustand state stores
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## Path Aliases

The project uses `@/` as an alias for the `src/` directory:

```typescript
import { Component } from '@/components/Component'
```

## Development Guidelines

- Use functional components with TypeScript
- Follow Material UI theming patterns
- Use React Hook Form for forms
- Implement proper error handling

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

## Next Steps

1. Set up authentication flow
2. Create layout components
3. Implement routing structure
4. Set up API client
5. Create Zustand stores
