import { useEffect, useCallback, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useOrdersStore } from '@/stores/orders.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import { OrderStatus, UserRole, type Item, type OrderCreator } from '@/types/models'
import * as itemsApi from '@/api/items.api'

interface RejectFormValues {
  reason: string
}

function statusColor(status: string) {
  if (status === OrderStatus.APPROVED) return 'success' as const
  if (status === OrderStatus.REJECTED) return 'error' as const
  return 'warning' as const
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const notify = useUiStore((s) => s.notify)
  const { currentOrder, loading, error, fetchOrderById, approveOrder, rejectOrder } = useOrdersStore()

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [orderItems, setOrderItems] = useState<Item[]>([])

  const rejectForm = useForm<RejectFormValues>({ defaultValues: { reason: '' } })

  const isCompanyAdmin = user?.role === UserRole.COMPANY_ADMIN || user?.role === UserRole.EMPLOYER
  const isPending = currentOrder?.status === OrderStatus.PENDING

  const load = useCallback(() => {
    if (!id) return
    void fetchOrderById(id)
  }, [id, fetchOrderById])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!currentOrder?.items?.length) return
    Promise.all(currentOrder.items.map((itemId) => itemsApi.getItem(itemId).then((r) => r.data)))
      .then(setOrderItems)
      .catch(() => {/* silently fall back to IDs */})
  }, [currentOrder?.items])

  const handleApprove = async () => {
    if (!id) return
    try {
      await approveOrder(id)
      notify('Order approved', 'success')
      setApproveOpen(false)
    } catch {
      // store handles error
    }
  }

  const handleReject = async (values: RejectFormValues) => {
    if (!id) return
    try {
      await rejectOrder(id, values.reason.trim())
      notify('Order rejected', 'success')
      setRejectDialogOpen(false)
      rejectForm.reset()
    } catch {
      // store handles error
    }
  }

  if (!id) {
    return <Alert severity="error">Invalid order id</Alert>
  }

  const shortId = id.slice(-8).toUpperCase()

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
        <Button
          component={RouterLink}
          to={ROUTES.ORDERS}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Orders
        </Button>
        <Typography color="text.primary">#{shortId}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !currentOrder ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : currentOrder ? (
        <>
          <Card elevation={1} sx={{ borderRadius: 3, mb: 3, maxWidth: 640 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Order #{shortId}
                  </Typography>
                  <Chip
                    size="small"
                    label={currentOrder.status}
                    color={statusColor(currentOrder.status)}
                    variant="filled"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                {isCompanyAdmin && isPending && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                      onClick={() => setApproveOpen(true)}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5}>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>Type</Typography>
                  <Typography variant="body1">{currentOrder.orderType}</Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>Creator</Typography>
                  {typeof currentOrder.creator === 'object' ? (
                    <Box>
                      <Typography variant="body1">{(currentOrder.creator as OrderCreator).name}</Typography>
                      <Typography variant="body2" color="text.secondary">{(currentOrder.creator as OrderCreator).email}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{currentOrder.creator}</Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>Created</Typography>
                  <Typography variant="body1">{currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleDateString() : '—'}</Typography>
                </Stack>
                {currentOrder.approvedAt && (
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>Approved at</Typography>
                    <Typography variant="body1">{new Date(currentOrder.approvedAt).toLocaleDateString()}</Typography>
                  </Stack>
                )}
                {currentOrder.rejectionReason && (
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>Rejection reason</Typography>
                    <Typography variant="body1">{currentOrder.rejectionReason}</Typography>
                  </Stack>
                )}
                {currentOrder.devolutionReason && (
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>Devolution reason</Typography>
                    <Typography variant="body1">{currentOrder.devolutionReason}</Typography>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>

          {currentOrder.items.length > 0 && (
            <Box maxWidth={780}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Items ({currentOrder.items.length})
              </Typography>
              <Card elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Serial</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Brand</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Retail Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrder.items.map((itemId) => {
                      const item = orderItems.find((it) => it._id === itemId)
                      return (
                        <TableRow key={itemId} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {item?.serial ?? '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>{item?.name ?? itemId}</TableCell>
                          <TableCell>{item?.brand ?? '—'}</TableCell>
                          <TableCell align="right">{item ? `$${item.price}` : '—'}</TableCell>
                          <TableCell align="right">{item ? `$${item.retailPrice}` : '—'}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Card>
            </Box>
          )}
        </>
      ) : null}

      <ConfirmDialog
        open={approveOpen}
        title="Approve order"
        message="Are you sure you want to approve this order?"
        confirmLabel="Approve"
        confirmColor="success"
        onCancel={() => setApproveOpen(false)}
        onConfirm={handleApprove}
      />

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject order</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={rejectForm.handleSubmit(handleReject)} noValidate sx={{ mt: 1 }}>
            <TextField
              label="Rejection reason"
              fullWidth
              multiline
              minRows={3}
              required
              error={!!rejectForm.formState.errors.reason}
              helperText={rejectForm.formState.errors.reason?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...rejectForm.register('reason', { required: 'Rejection reason is required' })}
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button
                onClick={() => { setRejectDialogOpen(false); rejectForm.reset() }}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Reject order
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
