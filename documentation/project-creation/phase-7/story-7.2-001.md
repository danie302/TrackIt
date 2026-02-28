# Story 7.2-001: Routing Structure

## Metadata
- **Category:** Frontend Foundation
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 7.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Set up React Router with protected routes and role-based navigation guards.

## Tasks
1. Define route structure
2. Create ProtectedRoute component
3. Create RoleBasedRoute component
4. Implement redirect logic
5. Set up route guards
6. Create 404 Not Found page
7. Test routing navigation

## Technical Notes

### Route Configuration
```typescript
// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { Role } from '@types/user.types';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <RoleBasedRoute allowedRoles={[Role.MasterAdmin]}><MasterAdminDashboard /></RoleBasedRoute>,
      },
      {
        path: 'company-admin',
        element: <RoleBasedRoute allowedRoles={[Role.CompanyAdmin]}><CompanyAdminDashboard /></RoleBasedRoute>,
      },
      // ... more routes
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

### Protected Route Component
```typescript
// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### Role-Based Route
```typescript
// src/routes/RoleBasedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { Role } from '@types/user.types';

interface RoleBasedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const RoleBasedRoute = ({ allowedRoles, children }: RoleBasedRouteProps) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## Related Files
- `src/routes/index.tsx` (create)
- `src/routes/ProtectedRoute.tsx` (create)
- `src/routes/RoleBasedRoute.tsx` (create)
