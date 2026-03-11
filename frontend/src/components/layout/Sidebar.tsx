import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/models'
import { ROUTES } from '@/router/routes'

const DRAWER_WIDTH = 240

interface NavItem {
  label: string
  path: string
}

const navByRole: Record<UserRole, NavItem[]> = {
  [UserRole.MASTER_ADMIN]: [
    { label: 'Dashboard', path: ROUTES.MASTER_ADMIN_DASHBOARD },
    { label: 'Companies', path: ROUTES.MASTER_ADMIN_COMPANIES },
  ],
  [UserRole.COMPANY_ADMIN]: [
    { label: 'Dashboard', path: ROUTES.COMPANY_ADMIN_DASHBOARD },
    { label: 'Inventories', path: ROUTES.INVENTORIES },
    { label: 'Users', path: ROUTES.USERS },
    { label: 'Orders', path: ROUTES.ORDERS },
    { label: 'Audits', path: ROUTES.AUDITS },
  ],
  [UserRole.EMPLOYER]: [
    { label: 'Dashboard', path: ROUTES.COMPANY_ADMIN_DASHBOARD },
    { label: 'Inventories', path: ROUTES.INVENTORIES },
    { label: 'Orders', path: ROUTES.ORDERS },
    { label: 'Audits', path: ROUTES.AUDITS },
  ],
  [UserRole.RESELLER]: [
    { label: 'Dashboard', path: ROUTES.RESELLER_DASHBOARD },
    { label: 'Company Inventories', path: ROUTES.RESELLER_COMPANIES },
    { label: 'My Inventory', path: ROUTES.MY_INVENTORY },
    { label: 'Orders', path: ROUTES.ORDERS },
    { label: 'Devolutions', path: ROUTES.DEVOLUTION_ORDERS },
    { label: 'Audits', path: ROUTES.AUDITS },
  ],
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const navigate = useNavigate()

  const items = user ? (navByRole[user.role as UserRole] ?? []) : []

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path)
              onClose()
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  )

  return (
    <>
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
