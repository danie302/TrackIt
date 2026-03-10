import api from './axios'
import type { Category } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export interface GetCategoriesParams extends PaginationParams {
  companyId?: string
}

export const getCategories = (params?: GetCategoriesParams) =>
  api.get<PaginatedResult<Category>>('/categories', { params })

export const getCategory = (id: string) =>
  api.get<Category>(`/categories/${id}`)

export const createCategory = (data: Record<string, unknown>) =>
  api.post<Category>('/categories', data)

export const updateCategory = (id: string, data: Record<string, unknown>) =>
  api.patch<Category>(`/categories/${id}`, data)

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`)
