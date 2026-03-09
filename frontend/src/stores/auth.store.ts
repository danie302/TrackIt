import { create } from 'zustand'
import type { AuthUser } from '@/types/api'
import * as authApi from '@/api/auth.api'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  // Start in loading state so protected routes wait for session restore
  isLoading: true,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.login(email, password)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // proceed regardless
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    set({ user, accessToken, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  loadFromStorage: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      const { data } = await authApi.getMe()
      set({ user: data, accessToken: token, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
