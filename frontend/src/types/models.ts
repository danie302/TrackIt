export const UserRole = {
  MASTER_ADMIN: 'MasterAdmin',
  COMPANY_ADMIN: 'CompanyAdmin',
  EMPLOYER: 'Employer',
  RESELLER: 'Reseller',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const DniType = {
  CC: 'CC',
  TI: 'TI',
  CE: 'CE',
  PP: 'PP',
  NIT: 'NIT',
  PASSPORT: 'Passport',
} as const
export type DniType = (typeof DniType)[keyof typeof DniType]

export const OrderType = {
  STANDARD: 'Standard',
  DEVOLUTION: 'Devolution',
} as const
export type OrderType = (typeof OrderType)[keyof typeof OrderType]

export const OrderStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const AuditAction = {
  CREATE: 'Create',
  UPDATE: 'Update',
  DELETE: 'Delete',
  DEACTIVATE: 'Deactivate',
  APPROVE: 'Approve',
  REJECT: 'Reject',
  MOVE: 'Move',
} as const
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

export const EntityType = {
  COMPANY: 'Company',
  USER: 'User',
  CATEGORY: 'Category',
  INVENTORY: 'Inventory',
  ITEM: 'Item',
  ORDER_REQUEST: 'OrderRequest',
  AUDIT: 'Audit',
} as const
export type EntityType = (typeof EntityType)[keyof typeof EntityType]

export interface Company {
  _id: string
  name: string
  description?: string
  logo?: string
  nit: string
  userCount?: number
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  username: string
  cel: string
  dni: string
  typeOfDni: DniType
  role: UserRole
  companyId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  _id: string
  name: string
  companyId: string
  resellerId?: string
  isResellerInventory: boolean
  categories: string[]
  whitelist: string[]
  createdAt: string
  updatedAt: string
}

export interface Item {
  _id: string
  name: string
  brand: string
  serial: string
  price: number
  retailPrice: number
  inventoryId: string
  categories: string[]
  createdAt: string
  updatedAt: string
}

export interface OrderRequest {
  _id: string
  orderType: OrderType
  status: OrderStatus
  creator: string
  companyId: string
  sourceInventoryId: string
  targetInventoryId: string
  rejectionReason?: string
  devolutionReason?: string
  items: string[]
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Audit {
  _id: string
  entityType: EntityType
  entityId: string
  action: AuditAction
  actor: string
  description: string
  metadata?: Record<string, unknown>
  companyId?: string
  createdAt: string
  updatedAt: string
}
