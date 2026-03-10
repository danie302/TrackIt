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
import { ROUTES } from '@/router/routes'
import { OrderStatus } from '@/types/models'

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

export default function ResellerDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { inventories, loading: invLoading, fetchResellerInventories } = useInventoriesStore()
  const { orders, loading: ordersLoading, fetchResellerOrders } = useOrdersStore()

  const load = useCallback(async () => {
    await Promise.all([
      fetchResellerInventories(),
      fetchResellerOrders({ page: 1, limit: 1, status: OrderStatus.PENDING }),
    ])
  }, [fetchResellerInventories, fetchResellerOrders])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={1}>
        Welcome, {user?.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Reseller Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="My Inventory"
            count={inventories.total}
            loading={invLoading}
            buttonLabel="View my inventory"
            onButtonClick={() => navigate(ROUTES.MY_INVENTORY)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Pending Orders"
            count={orders.total}
            loading={ordersLoading}
            buttonLabel="View orders"
            onButtonClick={() => navigate(ROUTES.ORDERS)}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} mb={2}>
        Quick actions
      </Typography>
      <Grid container spacing={2}>
        {[
          { label: 'Browse companies', desc: 'Request items from whitelisted companies', route: ROUTES.RESELLER_COMPANIES },
          { label: 'My inventory', desc: 'View and return your assigned items', route: ROUTES.MY_INVENTORY },
          { label: 'My orders', desc: 'Track your standard order requests', route: ROUTES.ORDERS },
          { label: 'Devolutions', desc: 'Track your item return requests', route: ROUTES.DEVOLUTION_ORDERS },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.route}>
            <Card
              elevation={0}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              onClick={() => navigate(item.route)}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>{item.label}</Typography>
                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
