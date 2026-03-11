import api from './axios'
import type { User } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { DniType, UserRole } from '@/types/models'

export const getUsers = (params?: PaginationParams) =>
  api.get<PaginatedResult<User>>('/users', { params })

export const getUser = (id: string) =>
  api.get<User>(`/users/${id}`)

export interface CreateUserPayload {
  name: string
  email: string
  username: string
  password: string
  cel: string
  dni: string
  typeOfDni: DniType
  role: UserRole
  companyId?: string
}

export const createUser = (data: CreateUserPayload) =>
  api.post<User>('/users', data)

export const updateUser = (id: string, data: Record<string, unknown>) =>
  api.patch<User>(`/users/${id}`, data)

export const deactivateUser = (id: string) =>
  api.patch<User>(`/users/${id}/deactivate`)

export const activateUser = (id: string) =>
  api.patch<User>(`/users/${id}/activate`)

export const getResellers = () =>
  api.get<User[]>('/users/resellers')

export interface GetCompanyUsersParams extends PaginationParams {
  role?: UserRole
}

export const getCompanyUsers = (companyId: string, params?: GetCompanyUsersParams) =>
  api.get<PaginatedResult<User>>(`/companies/${companyId}/users`, { params })
