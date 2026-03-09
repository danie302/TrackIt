import { create } from 'zustand'

interface Notification {
  id: string
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

interface UiState {
  notifications: Notification[]
  isGlobalLoading: boolean
  notify: (message: string, severity?: Notification['severity']) => void
  dismissNotification: (id: string) => void
  setGlobalLoading: (loading: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  notifications: [],
  isGlobalLoading: false,

  notify: (message, severity = 'info') => {
    const id = crypto.randomUUID()
    set((state) => ({
      notifications: [...state.notifications, { id, message, severity }],
    }))
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
}))
