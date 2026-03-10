import { create } from 'zustand'
import type { Item } from '@/types/models'
import type { PaginatedResult } from '@/types/api'
import * as itemsApi from '@/api/items.api'

interface ItemsState {
  items: PaginatedResult<Item>
  currentItem: Item | null
  loading: boolean
  error: string | null
  fetchItems: (inventoryId: string, params?: itemsApi.GetItemsParams) => Promise<void>
  fetchItemById: (id: string) => Promise<void>
  createItem: (data: Record<string, unknown>) => Promise<Item>
  updateItem: (id: string, data: Record<string, unknown>) => Promise<Item>
  deleteItem: (id: string) => Promise<void>
}

export const useItemsStore = create<ItemsState>((set) => ({
  items: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  currentItem: null,
  loading: false,
  error: null,

  fetchItems: async (inventoryId, params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await itemsApi.getItems({ inventoryId, ...params })
      set({ items: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load items', loading: false })
    }
  },

  fetchItemById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await itemsApi.getItem(id)
      set({ currentItem: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load item', loading: false })
    }
  },

  createItem: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await itemsApi.createItem(payload)
      set({ loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to create item', loading: false })
      throw err
    }
  },

  updateItem: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await itemsApi.updateItem(id, payload)
      set({ currentItem: data, loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to update item', loading: false })
      throw err
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null })
    try {
      await itemsApi.deleteItem(id)
      set({ loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to delete item', loading: false })
      throw err
    }
  },
}))
