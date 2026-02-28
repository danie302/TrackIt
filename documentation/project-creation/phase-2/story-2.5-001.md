# Story 2.5-001: Permission System and Role Matrix

## Metadata
- **Category:** Security
- **Priority:** High
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 2.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Define comprehensive permission system with clear role-based access control matrix. Document all permissions for each role and implement permission checking service.

## Tasks
1. Define all permission constants
2. Create permission constants file
3. Define permissions for each role
4. Create role hierarchy service
5. Implement permission checking service
6. Document complete permission matrix
7. Create role comparison utilities
8. Write unit tests for permission service
9. Add permission matrix to API documentation

## Acceptance Criteria
- All permissions clearly defined and documented
- Role hierarchy enforced (Master Admin > Company Admin > Employer > Reseller)
- Permission matrix is comprehensive and covers all features
- Permission checking service works correctly
- Documentation is clear and accessible
- Unit tests verify all permission rules

## Technical Notes

### Permission Constants
```typescript
// auth/constants/permissions.ts
export const Permissions = {
  // Company Management
  COMPANY_CREATE: 'company:create',
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  COMPANY_LIST_ALL: 'company:list_all',

  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_LIST_ALL: 'user:list_all',
  USER_CHANGE_ROLE: 'user:change_role',

  // Inventory Management
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',
  INVENTORY_MANAGE_WHITELIST: 'inventory:manage_whitelist',

  // Item Management
  ITEM_CREATE: 'item:create',
  ITEM_READ: 'item:read',
  ITEM_UPDATE: 'item:update',
  ITEM_DELETE: 'item:delete',
  ITEM_TRANSFER: 'item:transfer',

  // Category Management
  CATEGORY_CREATE: 'category:create',
  CATEGORY_READ: 'category:read',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',

  // Order Management
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_APPROVE: 'order:approve',
  ORDER_REJECT: 'order:reject',
  ORDER_CANCEL: 'order:cancel',

  // Reseller Management
  RESELLER_CREATE: 'reseller:create',
  RESELLER_READ: 'reseller:read',
  RESELLER_UPDATE: 'reseller:update',
  RESELLER_DEACTIVATE: 'reseller:deactivate',

  // Audit Log
  AUDIT_READ: 'audit:read',
  AUDIT_READ_ALL: 'audit:read_all',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];
```

### Role Permissions Matrix
```typescript
// auth/constants/role-permissions.ts
import { Role } from '../../users/enums/role.enum';
import { Permissions, Permission } from './permissions';

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.MasterAdmin]: [
    // Master Admin has ALL permissions
    Permissions.COMPANY_CREATE,
    Permissions.COMPANY_READ,
    Permissions.COMPANY_UPDATE,
    Permissions.COMPANY_DELETE,
    Permissions.COMPANY_LIST_ALL,
    Permissions.USER_CREATE,
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
    Permissions.USER_LIST_ALL,
    Permissions.USER_CHANGE_ROLE,
    Permissions.INVENTORY_CREATE,
    Permissions.INVENTORY_READ,
    Permissions.INVENTORY_UPDATE,
    Permissions.INVENTORY_DELETE,
    Permissions.INVENTORY_MANAGE_WHITELIST,
    Permissions.ITEM_CREATE,
    Permissions.ITEM_READ,
    Permissions.ITEM_UPDATE,
    Permissions.ITEM_DELETE,
    Permissions.ITEM_TRANSFER,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_READ,
    Permissions.CATEGORY_UPDATE,
    Permissions.CATEGORY_DELETE,
    Permissions.ORDER_CREATE,
    Permissions.ORDER_READ,
    Permissions.ORDER_APPROVE,
    Permissions.ORDER_REJECT,
    Permissions.ORDER_CANCEL,
    Permissions.RESELLER_CREATE,
    Permissions.RESELLER_READ,
    Permissions.RESELLER_UPDATE,
    Permissions.RESELLER_DEACTIVATE,
    Permissions.AUDIT_READ,
    Permissions.AUDIT_READ_ALL,
  ],

  [Role.CompanyAdmin]: [
    // Company Admin: Full access within their company
    Permissions.COMPANY_READ,
    Permissions.COMPANY_UPDATE,
    Permissions.USER_CREATE,
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
    Permissions.USER_CHANGE_ROLE, // Can change roles within company
    Permissions.INVENTORY_CREATE,
    Permissions.INVENTORY_READ,
    Permissions.INVENTORY_UPDATE,
    Permissions.INVENTORY_DELETE,
    Permissions.INVENTORY_MANAGE_WHITELIST,
    Permissions.ITEM_CREATE,
    Permissions.ITEM_READ,
    Permissions.ITEM_UPDATE,
    Permissions.ITEM_DELETE,
    Permissions.ITEM_TRANSFER,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_READ,
    Permissions.CATEGORY_UPDATE,
    Permissions.CATEGORY_DELETE,
    Permissions.ORDER_CREATE,
    Permissions.ORDER_READ,
    Permissions.ORDER_APPROVE,
    Permissions.ORDER_REJECT,
    Permissions.ORDER_CANCEL,
    Permissions.RESELLER_CREATE,
    Permissions.RESELLER_READ,
    Permissions.RESELLER_UPDATE,
    Permissions.RESELLER_DEACTIVATE,
    Permissions.AUDIT_READ,
  ],

  [Role.Employer]: [
    // Employer: Inventory management + reseller creation only
    Permissions.INVENTORY_CREATE,
    Permissions.INVENTORY_READ,
    Permissions.INVENTORY_UPDATE,
    Permissions.INVENTORY_MANAGE_WHITELIST,
    Permissions.ITEM_CREATE,
    Permissions.ITEM_READ,
    Permissions.ITEM_UPDATE,
    Permissions.ITEM_DELETE,
    Permissions.ITEM_TRANSFER,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_READ,
    Permissions.CATEGORY_UPDATE,
    Permissions.ORDER_READ, // Can view orders related to their inventory
    Permissions.ORDER_APPROVE,
    Permissions.ORDER_REJECT,
    Permissions.RESELLER_CREATE,
    Permissions.RESELLER_READ,
    Permissions.AUDIT_READ,
  ],

  [Role.Reseller]: [
    // Reseller: View whitelisted inventories + create orders
    Permissions.INVENTORY_READ, // Only whitelisted inventories
    Permissions.ITEM_READ, // Only from whitelisted inventories
    Permissions.CATEGORY_READ,
    Permissions.ORDER_CREATE,
    Permissions.ORDER_READ, // Only their own orders
    Permissions.ORDER_CANCEL, // Only their own pending orders
  ],
};
```

### Permissions Service
```typescript
// auth/services/permissions.service.ts
import { Injectable } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum';
import { Permission } from '../constants/permissions';
import { RolePermissions } from '../constants/role-permissions';

@Injectable()
export class PermissionsService {
  hasPermission(role: Role, permission: Permission): boolean {
    const rolePermissions = RolePermissions[role];
    return rolePermissions.includes(permission);
  }

  hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(role, permission));
  }

  hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(role, permission));
  }

  getRolePermissions(role: Role): Permission[] {
    return RolePermissions[role];
  }

  isRoleHigher(role1: Role, role2: Role): boolean {
    const hierarchy = {
      [Role.MasterAdmin]: 4,
      [Role.CompanyAdmin]: 3,
      [Role.Employer]: 2,
      [Role.Reseller]: 1,
    };

    return hierarchy[role1] > hierarchy[role2];
  }

  canManageUser(managerRole: Role, targetRole: Role): boolean {
    // Master Admin can manage anyone
    if (managerRole === Role.MasterAdmin) {
      return true;
    }

    // Company Admin can manage Employer and Reseller
    if (managerRole === Role.CompanyAdmin) {
      return [Role.Employer, Role.Reseller].includes(targetRole);
    }

    // Employer cannot manage users
    return false;
  }
}
```

### Role Hierarchy Utilities
```typescript
// auth/utils/role-hierarchy.ts
import { Role } from '../../users/enums/role.enum';

export class RoleHierarchy {
  private static readonly hierarchy: Record<Role, number> = {
    [Role.MasterAdmin]: 4,
    [Role.CompanyAdmin]: 3,
    [Role.Employer]: 2,
    [Role.Reseller]: 1,
  };

  static isHigher(role1: Role, role2: Role): boolean {
    return this.hierarchy[role1] > this.hierarchy[role2];
  }

  static isHigherOrEqual(role1: Role, role2: Role): boolean {
    return this.hierarchy[role1] >= this.hierarchy[role2];
  }

  static getLevel(role: Role): number {
    return this.hierarchy[role];
  }

  static canAssignRole(assignerRole: Role, targetRole: Role): boolean {
    // Can only assign roles lower in hierarchy
    return this.isHigher(assignerRole, targetRole);
  }
}
```

## Permission Matrix Documentation

### Master Admin
- **Scope:** Entire system
- **Key Permissions:**
  - Full CRUD on all companies
  - Full CRUD on all users across companies
  - Full CRUD on all inventories and items
  - View all audit logs
  - Manage all orders
  - System-wide administration

### Company Admin
- **Scope:** Single company
- **Key Permissions:**
  - Update own company information
  - Full CRUD on users within company
  - Full CRUD on inventories and items
  - Manage categories
  - Create and manage resellers
  - Approve/reject orders
  - View company audit logs
  - Manage inventory whitelists

### Employer
- **Scope:** Company inventory
- **Key Permissions:**
  - Manage inventories (create, read, update)
  - Full CRUD on items
  - Manage categories
  - Create resellers
  - View and approve/reject orders
  - Manage inventory whitelists
  - View inventory-related audit logs

### Reseller
- **Scope:** Whitelisted inventories
- **Key Permissions:**
  - View whitelisted inventories (read-only)
  - View items from whitelisted inventories
  - Create orders
  - View own orders
  - Cancel own pending orders

## Testing Requirements
- Test Master Admin has all permissions
- Test Company Admin has correct subset
- Test Employer has correct subset
- Test Reseller has minimal permissions
- Test role hierarchy comparison
- Test permission checking service
- Test canManageUser logic for all role combinations
- Test getRolePermissions returns correct permissions

## Documentation Requirements
- Create comprehensive permission matrix table
- Document role hierarchy
- Document permission naming conventions
- Add examples of permission usage
- Create authorization decision flowchart

## Related Files
- `src/auth/constants/permissions.ts` (create)
- `src/auth/constants/role-permissions.ts` (create)
- `src/auth/services/permissions.service.ts` (create)
- `src/auth/utils/role-hierarchy.ts` (create)
- `documentation/PERMISSION-MATRIX.md` (create)

## Notes
- Permissions follow pattern: `resource:action`
- Role hierarchy: Master Admin > Company Admin > Employer > Reseller
- Master Admin bypasses most authorization checks
- Resellers have most restricted access
- Company data isolation enforced at service layer
- Permission matrix should be reviewed with stakeholders
- Consider implementing feature flags for permission toggling
- Audit all permission checks in production
