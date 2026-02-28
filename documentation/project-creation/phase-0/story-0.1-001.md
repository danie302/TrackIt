# Story 0.1-001: Initialize Frontend with Vite and React

## Metadata
- **Category:** Infrastructure
- **Priority:** Critical
- **Estimated Effort:** 2 hours
- **Dependencies:** None
- **Assignee:** TBD
- **Status:** Not Started

## Description
Set up the frontend application using Vite, React, and TypeScript with proper project structure.

## Tasks
1. Run `npm create vite@latest frontend -- --template react-ts`
2. Install Material UI: `npm install @mui/material @emotion/react @emotion/styled`
3. Install additional dependencies: React Router, Zustand, Axios, React Hook Form
   - `npm install react-router-dom zustand axios react-hook-form`
   - `npm install @types/node -D`
4. Configure `tsconfig.json` with strict mode and path aliases
5. Create base folder structure: `src/components`, `src/pages`, `src/services`, `src/stores`, `src/types`, `src/utils`
6. Set up absolute imports with `@/` prefix
7. Create `.gitignore` for frontend

## Acceptance Criteria
- Frontend app runs with `npm run dev`
- TypeScript compiles without errors
- Material UI is importable
- Folder structure is in place
- Absolute imports work with `@/` prefix

## Technical Notes
- Use Vite for fast development and optimized builds
- Configure path aliases in both `tsconfig.json` and `vite.config.ts`
- Ensure strict TypeScript mode for type safety
- Material UI v5+ uses Emotion for styling

### tsconfig.json Path Configuration
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### vite.config.ts Path Configuration
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Testing Requirements
- Unit tests: Not applicable for initial setup
- Integration tests: Verify app starts without errors

## Documentation Requirements
- Create `frontend/README.md` with setup instructions
- Document folder structure and conventions

## Related Files
- `frontend/package.json` - Dependencies
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/vite.config.ts` - Vite configuration
- `frontend/.gitignore` - Git ignore rules
- `frontend/src/*` - Source code structure

## Notes
- After setup, run `npm run dev` to verify everything works
- Default port is 5173 (Vite default)
- Consider adding ESLint and Prettier for code quality (optional for MVP)
