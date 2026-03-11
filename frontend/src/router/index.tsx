import { createBrowserRouter } from 'react-router-dom'
import { UserRole } from '@/types/models'
import ProtectedRoute from './ProtectedRoute'
import AuthLayout from '@/components/layout/AuthLayout'
import AppLayout from '@/components/layout/AppLayout'
import { ROUTES } from '@/router/routes'

import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import MasterAdminDashboard from '@/pages/MasterAdminDashboard'
import CompaniesPage from '@/pages/CompaniesPage'
import CompanyDetailPage from '@/pages/CompanyDetailPage'
import CompanyCreatePage from '@/pages/CompanyCreatePage'
import DashboardPage from '@/pages/DashboardPage'
import InventoriesPage from '@/pages/InventoriesPage'
import InventoryDetailPage from '@/pages/InventoryDetailPage'
import InventoryCreatePage from '@/pages/InventoryCreatePage'
import UsersPage from '@/pages/UsersPage'
import UserCreatePage from '@/pages/UserCreatePage'
import UserDetailPage from '@/pages/UserDetailPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import ResellerDashboard from '@/pages/ResellerDashboard'
import MyInventoryPage from '@/pages/MyInventoryPage'
import DevolutionOrdersPage from '@/pages/DevolutionOrdersPage'
import CompanyInventoriesPage from '@/pages/CompanyInventoriesPage'
import CompanyInventoryItemsPage from '@/pages/CompanyInventoryItemsPage'
import CreateStandardOrderPage from '@/pages/CreateStandardOrderPage'
import CreateDevolutionOrderPage from '@/pages/CreateDevolutionOrderPage'
import AuditsPage from '@/pages/AuditsPage'
import AuditDetailPage from '@/pages/AuditDetailPage'
import NotFound from '@/pages/NotFound'
import RootRedirect from './RootRedirect'
import MasterAdminCompaniesRedirect from './redirects/MasterAdminCompaniesRedirect'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <RootRedirect /> },
          // Master Admin routes
          {
            element: <ProtectedRoute allowedRoles={[UserRole.MASTER_ADMIN]} />,
            children: [
              { path: ROUTES.MASTER_ADMIN_DASHBOARD, element: <MasterAdminDashboard /> },
              { path: ROUTES.MASTER_ADMIN_COMPANIES, element: <MasterAdminDashboard /> },
              { path: ROUTES.MASTER_ADMIN_COMPANY_CREATE, element: <CompanyCreatePage /> },
              { path: ROUTES.MASTER_ADMIN_COMPANY_DETAIL, element: <CompanyDetailPage /> },

              // Legacy Master Admin paths (redirect to new)
              { path: ROUTES.COMPANIES, element: <MasterAdminCompaniesRedirect to={ROUTES.MASTER_ADMIN_COMPANIES} /> },
              { path: ROUTES.COMPANY_CREATE, element: <MasterAdminCompaniesRedirect to={ROUTES.MASTER_ADMIN_COMPANY_CREATE} /> },
              { path: ROUTES.COMPANY_DETAIL, element: <MasterAdminCompaniesRedirect to={ROUTES.MASTER_ADMIN_COMPANY_DETAIL} /> },

              // Keep old placeholder route but unused
              { path: '/master-admin/companies-old', element: <CompaniesPage /> },
            ],
          },
          // Company Admin + Employer shared routes
          {
            element: <ProtectedRoute allowedRoles={[UserRole.COMPANY_ADMIN, UserRole.EMPLOYER]} />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/inventories', element: <InventoriesPage /> },
              { path: '/inventories/new', element: <InventoryCreatePage /> },
              { path: '/inventories/:id', element: <InventoryDetailPage /> },
            ],
          },
          // Company Admin only routes
          {
            element: <ProtectedRoute allowedRoles={[UserRole.COMPANY_ADMIN]} />,
            children: [
              { path: '/users', element: <UsersPage /> },
              { path: '/users/new', element: <UserCreatePage /> },
              { path: '/users/:id', element: <UserDetailPage /> },
            ],
          },
          // Reseller routes
          {
            element: <ProtectedRoute allowedRoles={[UserRole.RESELLER]} />,
            children: [
              { path: '/reseller', element: <ResellerDashboard /> },
              { path: '/my-inventory', element: <MyInventoryPage /> },
              { path: '/devolution-orders', element: <DevolutionOrdersPage /> },
              { path: '/reseller/companies', element: <CompanyInventoriesPage /> },
              { path: '/reseller/companies/:inventoryId', element: <CompanyInventoryItemsPage /> },
              { path: '/reseller/orders/new', element: <CreateStandardOrderPage /> },
              { path: '/reseller/devolutions/new', element: <CreateDevolutionOrderPage /> },
            ],
          },
          // Shared authenticated routes (accessible to all roles)
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
          { path: '/audits', element: <AuditsPage /> },
          { path: '/audits/:id', element: <AuditDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
