# Story 7.3-001: State Management with Zustand

## Metadata
- **Category:** Frontend Foundation
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 7.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create Zustand stores for authentication, UI state, and data caching.

## Tasks
1. Create auth store
2. Create UI store
3. Create cache store
4. Implement persist middleware
5. Add store selectors
6. Test store actions

## Technical Notes

### Auth Store
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, tokens) =>
        set({
          user,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### UI Store
```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  loading: boolean;
  notifications: Notification[];
  sidebarOpen: boolean;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  notifications: [],
  sidebarOpen: true,
  setLoading: (loading) => set({ loading }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### Cache Store
```typescript
// src/stores/cacheStore.ts
import { create } from 'zustand';

interface CacheState {
  companies: any[];
  categories: Record<string, any[]>;
  setCompanies: (companies: any[]) => void;
  setCategories: (companyId: string, categories: any[]) => void;
  clearCache: () => void;
}

export const useCacheStore = create<CacheState>((set) => ({
  companies: [],
  categories: {},
  setCompanies: (companies) => set({ companies }),
  setCategories: (companyId, categories) =>
    set((state) => ({
      categories: { ...state.categories, [companyId]: categories },
    })),
  clearCache: () => set({ companies: [], categories: {} }),
}));
```

## Related Files
- `src/stores/authStore.ts` (create)
- `src/stores/uiStore.ts` (create)
- `src/stores/cacheStore.ts` (create)
