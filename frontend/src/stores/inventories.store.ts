import { create } from 'zustand'
import type { Inventory } from '@/types/models'
import type { PaginatedResult } from '@/types/api'
import * as inventoriesApi from '@/api/inventories.api'

interface InventoriesState {
  inventories: PaginatedResult<Inventory>
  currentInventory: Inventory | null
  loading: boolean
  error: string | null
  fetchInventories: (companyId: string, params?: inventoriesApi.GetInventoriesParams) => Promise<void>
  fetchInventoryById: (id: string) => Promise<void>
  createInventory: (data: Record<string, unknown>) => Promise<Inventory>
  updateInventory: (id: string, data: Record<string, unknown>) => Promise<Inventory>
  deleteInventory: (id: string) => Promise<void>
}

export const useInventoriesStore = create<InventoriesState>((set) => ({
  inventories: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  currentInventory: null,
  loading: false,
  error: null,

  fetchInventories: async (companyId, params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await inventoriesApi.getInventories({ companyId, ...params })
      set({ inventories: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load inventories', loading: false })
    }
  },

  fetchInventoryById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await inventoriesApi.getInventory(id)
      set({ currentInventory: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load inventory', loading: false })
    }
  },

  createInventory: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await inventoriesApi.createInventory(payload)
      set({ loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to create inventory', loading: false })
      throw err
    }
  },

  updateInventory: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await inventoriesApi.updateInventory(id, payload)
      set({ currentInventory: data, loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to update inventory', loading: false })
      throw err
    }
  },

  deleteInventory: async (id) => {
    set({ loading: true, error: null })
    try {
      await inventoriesApi.deleteInventory(id)
      set({ loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to delete inventory', loading: false })
      throw err
    }
  },
}))
