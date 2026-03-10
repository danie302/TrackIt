import { create } from 'zustand'
import type { Category } from '@/types/models'
import type { PaginatedResult } from '@/types/api'
import * as categoriesApi from '@/api/categories.api'

interface CategoriesState {
  categories: PaginatedResult<Category>
  loading: boolean
  error: string | null
  fetchCategories: (companyId: string, params?: categoriesApi.GetCategoriesParams) => Promise<void>
  createCategory: (name: string, companyId: string) => Promise<Category>
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  error: null,

  fetchCategories: async (companyId, params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await categoriesApi.getCategories({ companyId, ...params })
      set({ categories: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load categories', loading: false })
    }
  },

  createCategory: async (name, companyId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await categoriesApi.createCategory({ name, companyId })
      set({ loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to create category', loading: false })
      throw err
    }
  },
}))
