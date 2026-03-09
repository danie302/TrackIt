import api from './axios'
import type { Company } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export interface GetCompaniesParams extends PaginationParams {
  search?: string
  sortBy?: 'createdAt' | 'name'
  sortDir?: 'asc' | 'desc'
}

export const getCompanies = (params?: GetCompaniesParams) =>
  api.get<PaginatedResult<Company>>('/companies', { params })

export const getCompany = (id: string) =>
  api.get<Company>(`/companies/${id}`)

export interface CreateCompanyPayload {
  name: string
  nit: string
  description?: string
  logo?: string
}

export const createCompany = (data: CreateCompanyPayload) =>
  api.post<Company>('/companies', data)

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>

export const updateCompany = (id: string, data: UpdateCompanyPayload) =>
  api.patch<Company>(`/companies/${id}`, data)
