/**
 * Permission constants and role hierarchy for Track It.
 * Used by guards and services to enforce access control.
 */

import { UserRole } from '../../users/schemas/user.schema';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.MASTER_ADMIN]: 100,
  [UserRole.COMPANY_ADMIN]: 80,
  [UserRole.EMPLOYER]: 60,
  [UserRole.RESELLER]: 40,
};

/** Roles that can manage users within a company */
export const COMPANY_USER_MANAGEMENT_ROLES: UserRole[] = [
  UserRole.MASTER_ADMIN,
  UserRole.COMPANY_ADMIN,
];

/** Roles that can create only resellers (not other roles) */
export const CAN_CREATE_RESELLERS_ONLY: UserRole[] = [
  UserRole.COMPANY_ADMIN,
  UserRole.EMPLOYER,
];

/** Roles that can approve/reject order requests */
export const ORDER_APPROVAL_ROLES: UserRole[] = [
  UserRole.COMPANY_ADMIN,
  UserRole.EMPLOYER,
];

/** Roles that can manage inventories and items */
export const INVENTORY_MANAGEMENT_ROLES: UserRole[] = [
  UserRole.MASTER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.EMPLOYER,
];

/** Roles that can create order requests (resellers) */
export const CAN_CREATE_ORDERS: UserRole[] = [UserRole.RESELLER];

/** Full system access (Master Admin only) */
export const SYSTEM_ACCESS_ROLES: UserRole[] = [UserRole.MASTER_ADMIN];

export function hasMinRole(userRole: UserRole, minLevel: number): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= minLevel;
}

export function canManageCompanyUsers(role: UserRole): boolean {
  return COMPANY_USER_MANAGEMENT_ROLES.includes(role);
}

export function canApproveOrders(role: UserRole): boolean {
  return ORDER_APPROVAL_ROLES.includes(role);
}

export function canManageInventory(role: UserRole): boolean {
  return INVENTORY_MANAGEMENT_ROLES.includes(role);
}

export function canCreateOrders(role: UserRole): boolean {
  return CAN_CREATE_ORDERS.includes(role);
}

export function hasSystemAccess(role: UserRole): boolean {
  return SYSTEM_ACCESS_ROLES.includes(role);
}
