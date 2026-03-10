import api from './axios'
import type { OrderRequest } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export interface GetOrdersParams extends PaginationParams {
  companyId?: string
  status?: string
  orderType?: string
}

export const getOrders = (params?: GetOrdersParams) =>
  api.get<PaginatedResult<OrderRequest>>('/orders', { params })

export const getOrder = (id: string) =>
  api.get<OrderRequest>(`/orders/${id}`)

export const createStandardOrder = (data: Record<string, unknown>) =>
  api.post<OrderRequest>('/orders/standard', data)

export const createDevolutionOrder = (data: Record<string, unknown>) =>
  api.post<OrderRequest>('/orders/devolution', data)

export const approveOrder = (id: string) =>
  api.patch<OrderRequest>(`/orders/${id}/approve`)

export const rejectOrder = (id: string, reason: string) =>
  api.patch<OrderRequest>(`/orders/${id}/reject`, { rejectionReason: reason })

export const getUserOrders = (userId: string, params?: PaginationParams) =>
  api.get<PaginatedResult<OrderRequest>>(`/users/${userId}/orders`, { params })
