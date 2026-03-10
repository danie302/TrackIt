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
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useOrdersStore } from '@/stores/orders.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import { OrderStatus, UserRole } from '@/types/models'

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

  const rejectForm = useForm<RejectFormValues>({ defaultValues: { reason: '' } })

  const isCompanyAdmin = user?.role === UserRole.COMPANY_ADMIN
  const isPending = currentOrder?.status === OrderStatus.PENDING

  const load = useCallback(() => {
    if (!id) return
    void fetchOrderById(id)
  }, [id, fetchOrderById])

  useEffect(() => {
    load()
  }, [load])

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
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{currentOrder.creator}</Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>Created</Typography>
                  <Typography variant="body1">{new Date(currentOrder.createdAt).toLocaleDateString()}</Typography>
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
            <Box maxWidth={640}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Items ({currentOrder.items.length})
              </Typography>
              <Card elevation={1} sx={{ borderRadius: 3 }}>
                <List dense disablePadding>
                  {currentOrder.items.map((itemId, i) => (
                    <ListItem key={itemId} divider={i < currentOrder.items.length - 1}>
                      <ListItemText
                        primary={itemId}
                        primaryTypographyProps={{ variant: 'body2', sx: { fontFamily: 'monospace', wordBreak: 'break-all' } }}
                      />
                    </ListItem>
                  ))}
                </List>
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
