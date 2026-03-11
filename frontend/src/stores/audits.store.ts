import { create } from 'zustand'
import type { Audit } from '@/types/models'
import type { PaginatedResult } from '@/types/api'
import * as auditsApi from '@/api/audits.api'

interface AuditsState {
  audits: PaginatedResult<Audit>
  currentAudit: Audit | null
  loading: boolean
  error: string | null
  fetchAudits: (params?: auditsApi.GetAuditsParams) => Promise<void>
  fetchEntityAudits: (entityType: string, entityId: string, params?: { page?: number; limit?: number }) => Promise<void>
  fetchItemAuditTrail: (itemId: string, params?: { page?: number; limit?: number }) => Promise<void>
  fetchAuditById: (id: string) => Promise<void>
}

const empty: PaginatedResult<Audit> = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }

export const useAuditsStore = create<AuditsState>((set) => ({
  audits: empty,
  currentAudit: null,
  loading: false,
  error: null,

  fetchAudits: async (params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await auditsApi.getAudits(params)
      set({ audits: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load audits', loading: false })
    }
  },

  fetchEntityAudits: async (entityType, entityId, params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await auditsApi.getEntityAudits(entityType, entityId, params)
      set({ audits: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load audits', loading: false })
    }
  },

  fetchItemAuditTrail: async (itemId, params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await auditsApi.getItemAuditTrail(itemId, params)
      set({ audits: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load audit trail', loading: false })
    }
  },

  fetchAuditById: async (id) => {
    set({ loading: true, error: null, currentAudit: null })
    try {
      const { data } = await auditsApi.getAuditById(id)
      set({ currentAudit: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load audit record', loading: false })
    }
  },
}))
