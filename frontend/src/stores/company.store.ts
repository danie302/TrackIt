import { create } from 'zustand'
import type { Company } from '@/types/models'
import type { PaginatedResult } from '@/types/api'
import * as companiesApi from '@/api/companies.api'

interface CompanyState {
  currentCompany: Company | null
  companies: PaginatedResult<Company>
  loading: boolean
  error: string | null
  setCurrentCompany: (company: Company | null) => void
  fetchCompanies: (params?: companiesApi.GetCompaniesParams) => Promise<void>
  fetchCompanyById: (id: string) => Promise<Company>
  createCompany: (payload: companiesApi.CreateCompanyPayload) => Promise<Company>
  updateCompany: (id: string, payload: companiesApi.UpdateCompanyPayload) => Promise<Company>
}

export const useCompanyStore = create<CompanyState>((set) => ({
  currentCompany: null,
  companies: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  error: null,
  setCurrentCompany: (company) => set({ currentCompany: company }),

  fetchCompanies: async (params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await companiesApi.getCompanies(params)
      set({ companies: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load companies', loading: false })
    }
  },

  fetchCompanyById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await companiesApi.getCompany(id)
      set({ currentCompany: data, loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load company', loading: false })
      throw err
    }
  },

  createCompany: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await companiesApi.createCompany(payload)
      set({ currentCompany: data, loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to create company', loading: false })
      throw err
    }
  },

  updateCompany: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await companiesApi.updateCompany(id, payload)
      set({ currentCompany: data, loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to update company', loading: false })
      throw err
    }
  },
}))
