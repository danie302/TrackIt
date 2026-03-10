import { useEffect, useCallback, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import DataTable from '@/components/common/DataTable'
import { useOrdersStore } from '@/stores/orders.store'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import { type OrderRequest, OrderStatus } from '@/types/models'

type StatusFilter = 'ALL' | OrderRequest['status']

function statusColor(status: OrderRequest['status']) {
  if (status === OrderStatus.APPROVED) return 'success' as const
  if (status === OrderStatus.REJECTED) return 'error' as const
  return 'warning' as const
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { orders, loading, error, fetchOrders } = useOrdersStore()

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const load = useCallback(() => {
    if (!user?.companyId) return
    const params: { page: number; limit: number; status?: string } = { page: page + 1, limit }
    if (statusFilter !== 'ALL') params.status = statusFilter
    void fetchOrders(user.companyId, params)
  }, [user?.companyId, page, limit, statusFilter, fetchOrders])

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(() => ([
    { key: 'orderType', label: 'Type', render: (o: OrderRequest) => o.orderType },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      render: (o: OrderRequest) => (
        <Chip size="small" label={o.status} color={statusColor(o.status)} variant="filled" />
      ),
    },
    { key: 'createdAt', label: 'Created', render: (o: OrderRequest) => new Date(o.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      width: 100,
      render: (o: OrderRequest) => (
        <Button
          size="small"
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none' }}
          onClick={(e) => {
            e.stopPropagation()
            navigate(ROUTES.ORDER_DETAIL.replace(':id', o._id))
          }}
        >
          View
        </Button>
      ),
    },
  ] satisfies Parameters<typeof DataTable<OrderRequest>>[0]['columns']), [navigate])

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to={ROUTES.COMPANY_ADMIN_DASHBOARD}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Dashboard
        </Button>
        <Typography color="text.primary">Orders</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Typography variant="h5" fontWeight={800}>
          Orders
        </Typography>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter)
            setPage(0)
          }}
          sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          size="small"
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
          <MenuItem value={OrderStatus.APPROVED}>Approved</MenuItem>
          <MenuItem value={OrderStatus.REJECTED}>Rejected</MenuItem>
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable<OrderRequest>
        columns={columns}
        data={orders.data}
        total={orders.total}
        page={page}
        limit={limit}
        loading={loading}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(0) }}
        onRowClick={(o) => navigate(ROUTES.ORDER_DETAIL.replace(':id', o._id))}
        emptyMessage="No orders found."
      />
    </Box>
  )
}
