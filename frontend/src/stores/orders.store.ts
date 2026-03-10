import { create } from 'zustand'
import type { OrderRequest } from '@/types/models'
import type { PaginatedResult } from '@/types/api'
import * as ordersApi from '@/api/orders.api'

interface OrdersState {
  orders: PaginatedResult<OrderRequest>
  currentOrder: OrderRequest | null
  loading: boolean
  error: string | null
  fetchOrders: (companyId: string, params?: ordersApi.GetOrdersParams) => Promise<void>
  fetchOrderById: (id: string) => Promise<void>
  approveOrder: (id: string) => Promise<OrderRequest>
  rejectOrder: (id: string, reason: string) => Promise<OrderRequest>
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  currentOrder: null,
  loading: false,
  error: null,

  fetchOrders: async (companyId, params) => {
    set({ loading: true, error: null })
    try {
      const { data } = await ordersApi.getOrders({ companyId, ...params })
      set({ orders: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load orders', loading: false })
    }
  },

  fetchOrderById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await ordersApi.getOrder(id)
      set({ currentOrder: data, loading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to load order', loading: false })
    }
  },

  approveOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await ordersApi.approveOrder(id)
      set({ currentOrder: data, loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to approve order', loading: false })
      throw err
    }
  },

  rejectOrder: async (id, reason) => {
    set({ loading: true, error: null })
    try {
      const { data } = await ordersApi.rejectOrder(id, reason)
      set({ currentOrder: data, loading: false })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      set({ error: msg ?? 'Failed to reject order', loading: false })
      throw err
    }
  },
}))
