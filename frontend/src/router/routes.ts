export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/',
  // Master Admin
  MASTER_ADMIN_DASHBOARD: '/master-admin',
  MASTER_ADMIN_COMPANIES: '/master-admin/companies',
  MASTER_ADMIN_COMPANY_DETAIL: '/master-admin/companies/:id',
  MASTER_ADMIN_COMPANY_CREATE: '/master-admin/companies/create',
  // Legacy Master Admin paths (kept for compatibility)
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/companies/:id',
  COMPANY_CREATE: '/companies/new',
  // Company Admin / Employer
  COMPANY_ADMIN_DASHBOARD: '/dashboard',
  INVENTORIES: '/inventories',
  INVENTORY_DETAIL: '/inventories/:id',
  INVENTORY_CREATE: '/inventories/new',
  USERS: '/users',
  USER_CREATE: '/users/new',
  USER_DETAIL: '/users/:id',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  // Reseller
  RESELLER_DASHBOARD: '/reseller',
  MY_INVENTORY: '/my-inventory',
  DEVOLUTION_ORDERS: '/devolution-orders',
  RESELLER_COMPANIES: '/reseller/companies',
  RESELLER_COMPANY_INVENTORY: '/reseller/companies/:inventoryId',
  RESELLER_ORDER_CREATE: '/reseller/orders/new',
  RESELLER_DEVOLUTION_CREATE: '/reseller/devolutions/new',
  // Shared
  AUDITS: '/audits',
  NOT_FOUND: '*',
}
