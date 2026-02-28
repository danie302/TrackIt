# Story 7.6-001: Type Definitions

## Metadata
- **Category:** Frontend Foundation
- **Priority:** High
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 7.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Define TypeScript interfaces and types for all data models, API requests/responses, and store types.

## Tasks
1. Define model interfaces
2. Define API request/response types
3. Define form data types
4. Define store types
5. Create utility types
6. Export all types from index

## Type Definitions

```typescript
// src/types/user.types.ts
export enum Role {
  MasterAdmin = 'MasterAdmin',
  CompanyAdmin = 'CompanyAdmin',
  Employer = 'Employer',
  Reseller = 'Reseller',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyId: string;
}

// src/types/company.types.ts
export interface Company {
  id: string;
  name: string;
  nit: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// src/types/inventory.types.ts
export interface Inventory {
  id: string;
  name: string;
  companyId: string;
  resellerId?: string;
  isResellerInventory: boolean;
  whitelist: string[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

// src/types/item.types.ts
export interface Item {
  id: string;
  name: string;
  brand: string;
  serial: string;
  price: number;
  retailPrice: number;
  categories: string[];
  inventoryId: string;
  createdAt: string;
  updatedAt: string;
}

// src/types/order.types.ts
export enum OrderType {
  Standard = 'Standard',
  Devolution = 'Devolution',
}

export enum OrderStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface OrderRequest {
  id: string;
  orderType: OrderType;
  status: OrderStatus;
  resellerId: string;
  items: string[];
  sourceInventoryId: string;
  targetInventoryId?: string;
  requestDate: string;
  approvalDate?: string;
  rejectionReason?: string;
}

// src/types/api.types.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: string[];
}
```

## Related Files
- `src/types/user.types.ts` (create)
- `src/types/company.types.ts` (create)
- `src/types/inventory.types.ts` (create)
- `src/types/item.types.ts` (create)
- `src/types/order.types.ts` (create)
- `src/types/audit.types.ts` (create)
- `src/types/api.types.ts` (create)
- `src/types/index.ts` (create)
