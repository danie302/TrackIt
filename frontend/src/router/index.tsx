import { createBrowserRouter } from 'react-router-dom'
import { UserRole } from '@/types/models'
import ProtectedRoute from './ProtectedRoute'
import AuthLayout from '@/components/layout/AuthLayout'
import AppLayout from '@/components/layout/AppLayout'

import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
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
import AuditsPage from '@/pages/AuditsPage'
import NotFound from '@/pages/NotFound'
import RootRedirect from './RootRedirect'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
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
              { path: '/master-admin', element: <MasterAdminDashboard /> },
              { path: '/companies', element: <CompaniesPage /> },
              { path: '/companies/new', element: <CompanyCreatePage /> },
              { path: '/companies/:id', element: <CompanyDetailPage /> },
            ],
          },
          // Company Admin + Employer routes
          {
            element: <ProtectedRoute allowedRoles={[UserRole.COMPANY_ADMIN, UserRole.EMPLOYER]} />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/inventories', element: <InventoriesPage /> },
              { path: '/inventories/new', element: <InventoryCreatePage /> },
              { path: '/inventories/:id', element: <InventoryDetailPage /> },
              { path: '/users', element: <UsersPage /> },
              { path: '/users/new', element: <UserCreatePage /> },
              { path: '/users/:id', element: <UserDetailPage /> },
              { path: '/orders', element: <OrdersPage /> },
              { path: '/orders/:id', element: <OrderDetailPage /> },
            ],
          },
          // Reseller routes
          {
            element: <ProtectedRoute allowedRoles={[UserRole.RESELLER]} />,
            children: [
              { path: '/reseller', element: <ResellerDashboard /> },
              { path: '/my-inventory', element: <MyInventoryPage /> },
              { path: '/devolution-orders', element: <DevolutionOrdersPage /> },
            ],
          },
          // Shared authenticated routes
          { path: '/audits', element: <AuditsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
