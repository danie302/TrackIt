import api from './axios'
import type { User } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export const getUsers = (params?: PaginationParams) =>
  api.get<PaginatedResult<User>>('/users', { params })

export const getUser = (id: string) =>
  api.get<User>(`/users/${id}`)

export const createUser = (data: Record<string, unknown>) =>
  api.post<User>('/users', data)

export const updateUser = (id: string, data: Record<string, unknown>) =>
  api.put<User>(`/users/${id}`, data)

export const deactivateUser = (id: string) =>
  api.delete(`/users/${id}`)

export const getCompanyUsers = (companyId: string, params?: PaginationParams) =>
  api.get<PaginatedResult<User>>(`/companies/${companyId}/users`, { params })
