import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { useInventoriesStore } from '@/stores/inventories.store'
import { useOrdersStore } from '@/stores/orders.store'
import { useCompanyUsersStore } from '@/stores/companyUsers.store'
import { ROUTES } from '@/router/routes'
import { UserRole } from '@/types/models'

function StatCard({
  title,
  count,
  loading,
  buttonLabel,
  onButtonClick,
}: {
  title: string
  count: number
  loading: boolean
  buttonLabel: string
  onButtonClick: () => void
}) {
  return (
    <Card elevation={1} sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={60} height={56} />
        ) : (
          <Typography variant="h3" fontWeight={800} sx={{ my: 0.5 }}>
            {count}
          </Typography>
        )}
        <Button
          variant="contained"
          size="small"
          sx={{ mt: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          onClick={onButtonClick}
          disabled={loading}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { inventories, loading: invLoading, fetchInventories } = useInventoriesStore()
  const { orders, loading: ordersLoading, fetchOrders } = useOrdersStore()
  const { users, loading: usersLoading, fetchCompanyUsers } = useCompanyUsersStore()

  const isCompanyAdmin = user?.role === UserRole.COMPANY_ADMIN

  const load = useCallback(async () => {
    if (!user?.companyId) return
    const tasks: Promise<void>[] = [
      fetchInventories(user.companyId, { page: 1, limit: 1 }),
      fetchOrders(user.companyId, { page: 1, limit: 1 }),
    ]
    if (isCompanyAdmin) {
      tasks.push(fetchCompanyUsers(user.companyId, { page: 1, limit: 1 }))
    }
    await Promise.all(tasks)
  }, [user?.companyId, isCompanyAdmin, fetchInventories, fetchOrders, fetchCompanyUsers])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Dashboard
      </Typography>

      {!user?.companyId && (
        <Typography color="text.secondary">No company associated with your account.</Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={isCompanyAdmin ? 4 : 6}>
          <StatCard
            title="Inventories"
            count={inventories.total}
            loading={invLoading}
            buttonLabel="View inventories"
            onButtonClick={() => navigate(ROUTES.INVENTORIES)}
          />
        </Grid>

        {isCompanyAdmin && (
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Users"
              count={users.total}
              loading={usersLoading}
              buttonLabel="View users"
              onButtonClick={() => navigate(ROUTES.USERS)}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={isCompanyAdmin ? 4 : 6}>
          <StatCard
            title="Orders"
            count={orders.total}
            loading={ordersLoading}
            buttonLabel="View orders"
            onButtonClick={() => navigate(ROUTES.ORDERS)}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
