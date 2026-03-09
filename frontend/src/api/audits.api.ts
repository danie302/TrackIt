import api from './axios'
import type { Audit } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export const getAudits = (params?: PaginationParams) =>
  api.get<PaginatedResult<Audit>>('/audits', { params })

export const getEntityAudits = (entityType: string, entityId: string, params?: PaginationParams) =>
  api.get<PaginatedResult<Audit>>(`/audits/entity/${entityType}/${entityId}`, { params })

export const getUserAudits = (userId: string, params?: PaginationParams) =>
  api.get<PaginatedResult<Audit>>(`/audits/user/${userId}`, { params })

export const getItemAuditTrail = (itemId: string, params?: PaginationParams) =>
  api.get<PaginatedResult<Audit>>(`/items/${itemId}/audit-trail`, { params })
