import { useEffect, useCallback, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DataTable from '@/components/common/DataTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useInventoriesStore } from '@/stores/inventories.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import { UserRole, type Inventory } from '@/types/models'

interface EditValues {
  name: string
}

export default function InventoriesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const notify = useUiStore((s) => s.notify)
  const { inventories, loading, error, fetchInventories, updateInventory, deleteInventory } = useInventoriesStore()

  const isCompanyAdmin = user?.role === UserRole.COMPANY_ADMIN

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [editTarget, setEditTarget] = useState<Inventory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Inventory | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditValues>()

  const load = useCallback(() => {
    if (!user?.companyId) return
    void fetchInventories(user.companyId, { page: page + 1, limit })
  }, [user?.companyId, page, limit, fetchInventories])

  useEffect(() => {
    load()
  }, [load])

  const openEdit = (inv: Inventory) => {
    setEditTarget(inv)
    reset({ name: inv.name })
  }

  const onEditSubmit = async (values: EditValues) => {
    if (!editTarget) return
    try {
      await updateInventory(editTarget._id, { name: values.name.trim() })
      notify('Inventory updated', 'success')
      setEditTarget(null)
      load()
    } catch {
      // store handles error
    }
  }

  const onDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteInventory(deleteTarget._id)
      notify('Inventory deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch {
      // store handles error
    }
  }

  const columns = useMemo(() => {
    const cols: Parameters<typeof DataTable<Inventory>>[0]['columns'] = [
      { key: 'name', label: 'Name', render: (inv) => inv.name },
      {
        key: 'createdAt',
        label: 'Created',
        render: (inv) => inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—',
      },
    ]
    if (isCompanyAdmin) {
      cols.push({
        key: 'actions',
        label: 'Actions',
        width: 140,
        render: (inv) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  openEdit(inv)
                }}
              >
                <span style={{ fontSize: 15 }}>✏️</span>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(inv)
                }}
              >
                <span style={{ fontSize: 15 }}>🗑️</span>
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      })
    }
    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompanyAdmin])

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
        <Typography color="text.primary">Inventories</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Typography variant="h5" fontWeight={800}>
          Inventories
        </Typography>
        {isCompanyAdmin && (
          <Button
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            onClick={() => navigate(ROUTES.INVENTORY_CREATE)}
          >
            New inventory
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable<Inventory>
        columns={columns}
        data={inventories.data}
        total={inventories.total}
        page={page}
        limit={limit}
        loading={loading}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l)
          setPage(0)
        }}
        onRowClick={(inv) => navigate(ROUTES.INVENTORY_DETAIL.replace(':id', inv._id))}
        emptyMessage="No inventories found."
      />

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit inventory</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onEditSubmit)} noValidate sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...register('name', { required: 'Name is required' })}
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={() => setEditTarget(null)} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Save
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete inventory"
        message={`Delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onDeleteConfirm}
      />
    </Box>
  )
}
