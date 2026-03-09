import api from './axios'
import type { AuthResponse } from '@/types/api'

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })

export const register = (data: Record<string, unknown>) =>
  api.post<AuthResponse>('/auth/register', data)

export const logout = () =>
  api.post('/auth/logout')

export const refreshToken = (token: string) =>
  api.post<AuthResponse>('/auth/refresh', { refreshToken: token })

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email })

export const resetPassword = (email: string, otp: string, newPassword: string) =>
  api.post('/auth/reset-password', { email, otp, newPassword })

export const getMe = () =>
  api.get('/auth/me')
