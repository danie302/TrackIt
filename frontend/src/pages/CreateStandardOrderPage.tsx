import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import { useOrdersStore } from '@/stores/orders.store'
import { useInventoriesStore } from '@/stores/inventories.store'
import { useItemsStore } from '@/stores/items.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import type { Item } from '@/types/models'

interface LocationState {
  selectedItemIds: string[]
  sourceInventoryId: string
}

export default function CreateStandardOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const notify = useUiStore((s) => s.notify)

  const { createStandardOrder, loading: orderLoading, error: orderError } = useOrdersStore()
  const { inventories, fetchResellerInventories } = useInventoriesStore()
  const { items, fetchItems } = useItemsStore()

  const [selectedItems, setSelectedItems] = useState<Item[]>([])

  const resellerInventory = inventories.data[0] ?? null

  useEffect(() => {
    void fetchResellerInventories()
  }, [fetchResellerInventories])

  useEffect(() => {
    if (!state?.sourceInventoryId) return
    void fetchItems(state.sourceInventoryId, { page: 1, limit: 100 })
  }, [state?.sourceInventoryId, fetchItems])

  useEffect(() => {
    if (!state?.selectedItemIds || items.data.length === 0) return
    setSelectedItems(items.data.filter((i) => state.selectedItemIds.includes(i._id)))
  }, [items.data, state?.selectedItemIds])

  const handleSubmit = async () => {
    if (!state || !resellerInventory) return
    try {
      await createStandardOrder({
        sourceInventoryId: state.sourceInventoryId,
        targetInventoryId: resellerInventory._id,
        items: state.selectedItemIds,
      })
      notify('Order submitted successfully', 'success')
      navigate(ROUTES.ORDERS)
    } catch {
      // store handles error
    }
  }

  if (!state?.selectedItemIds?.length) {
    return (
      <Box>
        <Alert severity="warning">
          No items selected.{' '}
          <Button size="small" onClick={() => navigate(ROUTES.RESELLER_COMPANIES)} sx={{ textTransform: 'none' }}>
            Go back
          </Button>
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to={ROUTES.RESELLER_DASHBOARD}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Dashboard
        </Button>
        <Button
          component={RouterLink}
          to={ROUTES.RESELLER_COMPANIES}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Company Inventories
        </Button>
        <Typography color="text.primary">Create Order</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={800} mb={3}>
        Create Standard Order
      </Typography>

      {orderError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {orderError}
        </Alert>
      )}

      <Card elevation={1} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Order Summary
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>Items requested</Typography>
              <Typography variant="body2" fontWeight={600}>{state.selectedItemIds.length}</Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>Destination inventory</Typography>
              <Typography variant="body2" fontWeight={600}>{resellerInventory?.name ?? '—'}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Selected Items
          </Typography>
          {selectedItems.length === 0 ? (
            <CircularProgress size={20} />
          ) : (
            <Stack spacing={1}>
              {selectedItems.map((item) => (
                <Stack key={item._id} direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 140 }} color="text.secondary">{item.serial}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.brand}</Typography>
                  <Typography variant="body2">${item.price}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none' }}
          onClick={() => navigate(-1)}
          disabled={orderLoading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          onClick={handleSubmit}
          disabled={orderLoading || !resellerInventory}
        >
          {orderLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit order'}
        </Button>
      </Stack>
    </Box>
  )
}
