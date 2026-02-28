# Story 17.2-001: Frontend Optimization

## Metadata
- **Category**: Frontend - Performance
- **Priority**: Medium
- **Estimated Effort**: 5 hours
- **Dependencies**: All frontend stories
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Optimize frontend with code splitting, lazy loading, and memoization.

## Tasks
1. Implement React.lazy() for route-based code splitting
2. Add React.memo() to expensive components
3. Use useMemo/useCallback where appropriate
4. Optimize bundle size with tree shaking
5. Implement virtual scrolling for long lists
6. Add image lazy loading
7. Minimize re-renders with proper state management
8. Use React Suspense for loading states

## Acceptance Criteria
- Initial bundle size <200KB
- Lazy loading works for all routes
- Virtual scrolling implemented for tables
- Re-renders minimized
- Load time improved by 40%+

## Technical Notes
```typescript
// Lazy load routes
const MasterAdminDashboard = React.lazy(() => import('./pages/MasterAdmin/Dashboard'));
const CompanyAdminDashboard = React.lazy(() => import('./pages/CompanyAdmin/Dashboard'));

// In App.tsx
<Suspense fallback={<CircularProgress />}>
  <Routes>
    <Route path="/master-admin" element={<MasterAdminDashboard />} />
  </Routes>
</Suspense>

// Memo expensive components
export const ItemTable = React.memo(({ items }) => { ... });

// Use virtual list for large tables
import { FixedSizeList } from 'react-window';
```

## Related Files
- `src/App.tsx` (add code splitting)
- All large components (add memo)
