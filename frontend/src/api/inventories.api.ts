import api from './axios'
import type { Inventory, Item } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export const getInventories = (params?: PaginationParams) =>
  api.get<PaginatedResult<Inventory>>('/inventories', { params })

export const getInventory = (id: string) =>
  api.get<Inventory>(`/inventories/${id}`)

export const createInventory = (data: Record<string, unknown>) =>
  api.post<Inventory>('/inventories', data)

export const updateInventory = (id: string, data: Record<string, unknown>) =>
  api.put<Inventory>(`/inventories/${id}`, data)

export const deleteInventory = (id: string) =>
  api.delete(`/inventories/${id}`)

export const addToWhitelist = (id: string, resellerId: string) =>
  api.post(`/inventories/${id}/whitelist`, { resellerId })

export const removeFromWhitelist = (id: string, resellerId: string) =>
  api.delete(`/inventories/${id}/whitelist/${resellerId}`)

export const getInventoryItems = (id: string, params?: PaginationParams) =>
  api.get<PaginatedResult<Item>>(`/inventories/${id}/items`, { params })
