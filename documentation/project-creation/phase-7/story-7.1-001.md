# Story 7.1-001: Frontend Project Setup

## Metadata
- **Category:** Frontend Foundation
- **Priority:** High
- **Estimated Effort:** 6 hours
- **Dependencies:** Story 0.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Set up React + Vite + TypeScript frontend with Material UI, React Router, and Zustand for state management.

## Tasks
1. Initialize Vite project with React + TypeScript
2. Install and configure Material UI
3. Install React Router v6
4. Install Zustand for state management
5. Install and configure Axios
6. Set up project structure (components, pages, services, stores, utils)
7. Configure environment variables
8. Set up ESLint and Prettier
9. Create base theme configuration
10. Configure path aliases

## Acceptance Criteria
- Vite project runs successfully
- Material UI theme applied
- React Router configured
- Zustand stores created
- Axios instance configured
- Project structure organized
- Environment variables working
- Code formatting configured

## Technical Notes

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### Project Structure
```
frontend/
├── src/
│   ├── api/           # API service modules
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── stores/        # Zustand stores
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── theme/         # MUI theme config
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example
├── vite.config.ts
└── tsconfig.json
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
```

### Theme Configuration
```typescript
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

## Related Files
- `frontend/package.json` (create)
- `frontend/vite.config.ts` (create)
- `frontend/tsconfig.json` (create)
- `frontend/.env.example` (create)
