import api from './axios'
import type { Audit } from '@/types/models'
import type { PaginatedResult, PaginationParams } from '@/types/api'

export interface GetAuditsParams extends PaginationParams {
  companyId?: string
  entityType?: string
  entityId?: string
  actor?: string
  action?: string
}

export const getAudits = (params?: GetAuditsParams) =>
  api.get<PaginatedResult<Audit>>('/audits', { params })

export const getAuditById = (id: string) =>
  api.get<Audit>(`/audits/${id}`)

export const getEntityAudits = (entityType: string, entityId: string, params?: PaginationParams) =>
  api.get<PaginatedResult<Audit>>('/audits', { params: { entityType, entityId, ...params } })

export const getItemAuditTrail = (itemId: string, params?: PaginationParams) =>
  api.get<PaginatedResult<Audit>>(`/audits/item/${itemId}/trail`, { params })
