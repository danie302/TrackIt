import api from './axios'
import type { Item } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export const getItems = (params?: PaginationParams) =>
  api.get<PaginatedResult<Item>>('/items', { params })

export const getItem = (id: string) =>
  api.get<Item>(`/items/${id}`)

export const createItem = (data: Record<string, unknown>) =>
  api.post<Item>('/items', data)

export const updateItem = (id: string, data: Record<string, unknown>) =>
  api.put<Item>(`/items/${id}`, data)

export const deleteItem = (id: string) =>
  api.delete(`/items/${id}`)
