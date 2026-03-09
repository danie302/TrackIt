export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/',
  // Master Admin
  MASTER_ADMIN_DASHBOARD: '/master-admin',
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
  // Shared
  AUDITS: '/audits',
  NOT_FOUND: '*',
}
