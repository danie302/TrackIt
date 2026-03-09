import api from './axios'
import type { Company } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export const getCompanies = (params?: PaginationParams) =>
  api.get<PaginatedResult<Company>>('/companies', { params })

export const getCompany = (id: string) =>
  api.get<Company>(`/companies/${id}`)

export const createCompany = (data: Record<string, unknown>) =>
  api.post<Company>('/companies', data)

export const updateCompany = (id: string, data: Record<string, unknown>) =>
  api.put<Company>(`/companies/${id}`, data)
