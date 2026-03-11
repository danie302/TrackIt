import { create } from 'zustand'
import type { User, UserRole } from '@/types/models'
import type { PaginatedResult } from '@/types/api'
import * as usersApi from '@/api/users.api'

interface CompanyUsersState {
  users: PaginatedResult<User>
  loading: boolean
  error: string | null
  fetchCompanyUsers: (companyId: string, params?: usersApi.GetCompanyUsersParams) => Promise<void>
  createUser: (payload: usersApi.CreateUserPayload) => Promise<User>
  updateUser: (id: string, payload: Partial<usersApi.CreateUserPayload>) => Promise<User>
  deactivateUser: (id: string) => Promise<User>
  activateUser: (id: string) => Promise<User>
  setRoleFilter: (role: UserRole | 'ALL') => void
  roleFilter: UserRole | 'ALL'
}

export const useCompanyUsersStore = create<CompanyUsersState>((set, get) => ({
  users: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  error: null,
  roleFilter: 'ALL',

  setRoleFilter: (role) => set({ roleFilter: role }),

  fetchCompanyUsers: async (companyId, params) => {
    set({ loading: true, error: null })
    try {
      const effectiveParams: usersApi.GetCompanyUsersParams = { ...(params ?? {}) }
      const role = get().roleFilter
      if (role !== 'ALL' && !effectiveParams.role) effectiveParams.role = role
      const { data } = await usersApi.getCompanyUsers(companyId, effectiveParams)
      set({ users: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load users', loading: false })
    }
  },

  createUser: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await usersApi.createUser(payload)
      set({ loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to create user', loading: false })
      throw err
    }
  },

  updateUser: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await usersApi.updateUser(id, payload)
      set({ loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to update user', loading: false })
      throw err
    }
  },

  deactivateUser: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await usersApi.deactivateUser(id)
      set({ loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to deactivate user', loading: false })
      throw err
    }
  },

  activateUser: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await usersApi.activateUser(id)
      set({ loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to activate user', loading: false })
      throw err
    }
  },
}))

