import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
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

interface FormValues {
  targetInventoryId: string
  devolutionReason: string
}

export default function CreateDevolutionOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const notify = useUiStore((s) => s.notify)

  const { createDevolutionOrder, loading: orderLoading, error: orderError } = useOrdersStore()
  const { inventories, fetchWhitelistedInventories } = useInventoriesStore()
  const { items, fetchItems } = useItemsStore()

  const [selectedItems, setSelectedItems] = useState<Item[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()

  useEffect(() => {
    void fetchWhitelistedInventories({ page: 1, limit: 100 })
  }, [fetchWhitelistedInventories])

  useEffect(() => {
    if (!state?.sourceInventoryId) return
    void fetchItems(state.sourceInventoryId, { page: 1, limit: 100 })
  }, [state?.sourceInventoryId, fetchItems])

  useEffect(() => {
    if (!state?.selectedItemIds || items.data.length === 0) return
    setSelectedItems(items.data.filter((i) => state.selectedItemIds.includes(i._id)))
  }, [items.data, state?.selectedItemIds])

  const onSubmit = async (values: FormValues) => {
    if (!state) return
    try {
      await createDevolutionOrder({
        sourceInventoryId: state.sourceInventoryId,
        targetInventoryId: values.targetInventoryId,
        items: state.selectedItemIds,
        devolutionReason: values.devolutionReason.trim(),
      })
      notify('Devolution order submitted successfully', 'success')
      navigate(ROUTES.DEVOLUTION_ORDERS)
    } catch {
      // store handles error
    }
  }

  if (!state?.selectedItemIds?.length) {
    return (
      <Box>
        <Alert severity="warning">
          No items selected.{' '}
          <Button size="small" onClick={() => navigate(ROUTES.MY_INVENTORY)} sx={{ textTransform: 'none' }}>
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
          to={ROUTES.MY_INVENTORY}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          My Inventory
        </Button>
        <Typography color="text.primary">Return Items</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={800} mb={3}>
        Return Items (Devolution)
      </Typography>

      {orderError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {orderError}
        </Alert>
      )}

      <Card elevation={1} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Items to Return
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
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <TextField
                select
                label="Return to inventory"
                fullWidth
                required
                error={!!errors.targetInventoryId}
                helperText={errors.targetInventoryId?.message}
                defaultValue=""
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...register('targetInventoryId', { required: 'Please select a target inventory' })}
              >
                <MenuItem value="" disabled>Select company inventory</MenuItem>
                {inventories.data.map((inv) => (
                  <MenuItem key={inv._id} value={inv._id}>{inv.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Reason for return"
                fullWidth
                required
                multiline
                rows={3}
                error={!!errors.devolutionReason}
                helperText={errors.devolutionReason?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...register('devolutionReason', { required: 'Reason is required' })}
              />

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
                  type="submit"
                  variant="contained"
                  color="warning"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  disabled={orderLoading}
                >
                  {orderLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit devolution'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
