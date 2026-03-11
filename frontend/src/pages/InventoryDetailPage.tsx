import { useEffect, useCallback, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import DataTable from '@/components/common/DataTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AuditHistory from '@/components/common/AuditHistory'
import { useInventoriesStore } from '@/stores/inventories.store'
import { useItemsStore } from '@/stores/items.store'
import { useOrdersStore } from '@/stores/orders.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { getResellers } from '@/api/users.api'
import { addToWhitelist, removeFromWhitelist } from '@/api/inventories.api'
import { ROUTES } from '@/router/routes'
import { UserRole, type Item, type OrderRequest, type User } from '@/types/models'

interface EditInventoryValues {
  name: string
}

interface ItemFormValues {
  name: string
  brand: string
  serial: string
  price: string
  retailPrice: string
}

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const notify = useUiStore((s) => s.notify)

  const { currentInventory, loading: invLoading, error: invError, fetchInventoryById, updateInventory } = useInventoriesStore()
  const { items, loading: itemsLoading, error: itemsError, fetchItems, createItem, updateItem, deleteItem } = useItemsStore()
  const { orders, loading: ordersLoading, error: ordersError, fetchOrders } = useOrdersStore()

  const isCompanyAdmin = user?.role === UserRole.COMPANY_ADMIN
  const canManageItems = user?.role === UserRole.COMPANY_ADMIN || user?.role === UserRole.EMPLOYER

  const [tab, setTab] = useState(0)
  const [itemPage, setItemPage] = useState(0)
  const [itemLimit, setItemLimit] = useState(10)
  const [orderPage, setOrderPage] = useState(0)
  const [orderLimit, setOrderLimit] = useState(10)

  const [editInvOpen, setEditInvOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [deleteItemTarget, setDeleteItemTarget] = useState<Item | null>(null)
  const [auditItem, setAuditItem] = useState<Item | null>(null)
  const [allResellers, setAllResellers] = useState<User[]>([])
  const [whitelistDialogOpen, setWhitelistDialogOpen] = useState(false)
  const [selectedResellerId, setSelectedResellerId] = useState('')
  const [whitelistLoading, setWhitelistLoading] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<User | null>(null)

  const invForm = useForm<EditInventoryValues>()
  const itemForm = useForm<ItemFormValues>({
    defaultValues: { name: '', brand: '', serial: '', price: '', retailPrice: '' },
  })

  const loadInventory = useCallback(() => {
    if (!id) return
    void fetchInventoryById(id)
  }, [id, fetchInventoryById])

  const loadItems = useCallback(() => {
    if (!id) return
    void fetchItems(id, { page: itemPage + 1, limit: itemLimit })
  }, [id, itemPage, itemLimit, fetchItems])

  const loadOrders = useCallback(() => {
    if (!user?.companyId) return
    void fetchOrders(user.companyId, { page: orderPage + 1, limit: orderLimit })
  }, [user?.companyId, orderPage, orderLimit, fetchOrders])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  useEffect(() => {
    if (tab === 0) loadItems()
  }, [tab, loadItems])

  useEffect(() => {
    if (tab === 1) loadOrders()
  }, [tab, loadOrders])

  useEffect(() => {
    if (tab === 3 && isCompanyAdmin) {
      getResellers().then(({ data }) => setAllResellers(data)).catch(() => {})
    }
  }, [tab, isCompanyAdmin])

  const handleAddToWhitelist = async () => {
    if (!id || !selectedResellerId) return
    setWhitelistLoading(true)
    try {
      await addToWhitelist(id, selectedResellerId)
      await fetchInventoryById(id)
      setWhitelistDialogOpen(false)
      setSelectedResellerId('')
      notify('Reseller added to whitelist', 'success')
    } catch {
      notify('Failed to add reseller', 'error')
    } finally {
      setWhitelistLoading(false)
    }
  }

  const handleRemoveFromWhitelist = async () => {
    if (!id || !removeTarget) return
    setWhitelistLoading(true)
    try {
      await removeFromWhitelist(id, removeTarget._id)
      await fetchInventoryById(id)
      setRemoveTarget(null)
      notify('Reseller removed from whitelist', 'success')
    } catch {
      notify('Failed to remove reseller', 'error')
    } finally {
      setWhitelistLoading(false)
    }
  }

  const openEditInv = () => {
    invForm.reset({ name: currentInventory?.name ?? '' })
    setEditInvOpen(true)
  }

  const onEditInvSubmit = async (values: EditInventoryValues) => {
    if (!id) return
    try {
      await updateInventory(id, { name: values.name.trim() })
      notify('Inventory updated', 'success')
      setEditInvOpen(false)
    } catch {
      // store handles error
    }
  }

  const openAddItem = () => {
    setEditItem(null)
    itemForm.reset({ name: '', brand: '', serial: '', price: '', retailPrice: '' })
    setItemDialogOpen(true)
  }

  const openEditItem = (item: Item) => {
    setEditItem(item)
    itemForm.reset({
      name: item.name,
      brand: item.brand,
      serial: item.serial,
      price: String(item.price),
      retailPrice: String(item.retailPrice),
    })
    setItemDialogOpen(true)
  }

  const onItemSubmit = async (values: ItemFormValues) => {
    if (!id) return
    try {
      if (editItem) {
        await updateItem(editItem._id, {
          name: values.name.trim(),
          brand: values.brand.trim(),
          serial: values.serial.trim(),
          price: Number(values.price),
          retailPrice: Number(values.retailPrice),
        })
        notify('Item updated', 'success')
      } else {
        await createItem({
          name: values.name.trim(),
          brand: values.brand.trim(),
          serial: values.serial.trim(),
          price: Number(values.price),
          retailPrice: Number(values.retailPrice),
          inventoryId: id,
        })
        notify('Item created', 'success')
      }
      setItemDialogOpen(false)
      setEditItem(null)
      loadItems()
    } catch {
      // store handles error
    }
  }

  const onDeleteItemConfirm = async () => {
    if (!deleteItemTarget) return
    try {
      await deleteItem(deleteItemTarget._id)
      notify('Item deleted', 'success')
      setDeleteItemTarget(null)
      loadItems()
    } catch {
      // store handles error
    }
  }

  const itemColumns = useMemo(() => {
    const cols: Parameters<typeof DataTable<Item>>[0]['columns'] = [
      { key: 'serial', label: 'Serial', render: (item) => item.serial },
      { key: 'name', label: 'Name', render: (item) => item.name },
      { key: 'brand', label: 'Brand', render: (item) => item.brand },
      { key: 'price', label: 'Price', render: (item) => `$${item.price}` },
    ]
    cols.push({
      key: 'history',
      label: '',
      width: 56,
      render: (item) => (
        <Tooltip title="Audit trail">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAuditItem(item) }}>
            <span style={{ fontSize: 15 }}>📋</span>
          </IconButton>
        </Tooltip>
      ),
    })
    if (canManageItems) {
      cols.push({
        key: 'actions',
        label: 'Actions',
        width: 140,
        render: (item) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditItem(item) }}>
                <span style={{ fontSize: 15 }}>✏️</span>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteItemTarget(item) }}>
                <span style={{ fontSize: 15 }}>🗑️</span>
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      })
    }
    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageItems])

  const orderColumns = useMemo(() => ([
    { key: 'orderType', label: 'Type', render: (o: OrderRequest) => o.orderType },
    {
      key: 'status',
      label: 'Status',
      render: (o: OrderRequest) => (
        <Chip
          size="small"
          label={o.status}
          color={o.status === 'Approved' ? 'success' : o.status === 'Rejected' ? 'error' : 'warning'}
          variant="filled"
        />
      ),
    },
    { key: 'createdAt', label: 'Created', render: (o: OrderRequest) => o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—' },
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

  if (!id) {
    return <Alert severity="error">Invalid inventory id</Alert>
  }

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
          to={ROUTES.INVENTORIES}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Inventories
        </Button>
        <Typography color="text.primary">{currentInventory?.name ?? 'Inventory'}</Typography>
      </Breadcrumbs>

      {invError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{invError}</Alert>}

      <Card elevation={1} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          {invLoading && !currentInventory ? (
            <CircularProgress size={24} />
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
              <Box>
                <Typography variant="h6" fontWeight={800}>{currentInventory?.name ?? '—'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Created: {currentInventory?.createdAt ? new Date(currentInventory.createdAt).toLocaleDateString() : '—'}
                </Typography>
              </Box>
              {isCompanyAdmin && (
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  onClick={openEditInv}
                  disabled={invLoading}
                >
                  Edit
                </Button>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v as number)} sx={{ mb: 2 }}>
        <Tab label="Items" />
        <Tab label="Orders" />
        <Tab label="Audit" />
        {isCompanyAdmin && !currentInventory?.isResellerInventory && <Tab label="Whitelist" />}
      </Tabs>

      {tab === 0 && (
        <Box>
          {itemsError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{itemsError}</Alert>}
          {canManageItems && (
            <Box mb={2}>
              <Button
                variant="contained"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                onClick={openAddItem}
              >
                Add item
              </Button>
            </Box>
          )}
          <DataTable<Item>
            columns={itemColumns}
            data={items.data}
            total={items.total}
            page={itemPage}
            limit={itemLimit}
            loading={itemsLoading}
            onPageChange={setItemPage}
            onLimitChange={(l) => { setItemLimit(l); setItemPage(0) }}
            emptyMessage="No items in this inventory."
          />
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {ordersError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{ordersError}</Alert>}
          <DataTable<OrderRequest>
            columns={orderColumns}
            data={orders.data}
            total={orders.total}
            page={orderPage}
            limit={orderLimit}
            loading={ordersLoading}
            onPageChange={setOrderPage}
            onLimitChange={(l) => { setOrderLimit(l); setOrderPage(0) }}
            onRowClick={(o) => navigate(ROUTES.ORDER_DETAIL.replace(':id', o._id))}
            emptyMessage="No orders found."
          />
        </Box>
      )}

      {tab === 2 && (
        <Card elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <AuditHistory mode="entity" entityType="Inventory" entityId={id} />
        </Card>
      )}

      {tab === 3 && isCompanyAdmin && !currentInventory?.isResellerInventory && (
        <Box>
          <Box mb={2}>
            <Button
              variant="contained"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              onClick={() => { setSelectedResellerId(''); setWhitelistDialogOpen(true) }}
            >
              Grant access
            </Button>
          </Box>

          <Card elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {!currentInventory?.whitelist?.length ? (
              <Box px={2} py={3}>
                <Typography variant="body2" color="text.secondary">
                  No resellers have access to this inventory yet.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={0}>
                {currentInventory.whitelist.map((resellerId, i) => {
                  const reseller = allResellers.find((r) => r._id === resellerId)
                  return (
                    <Box
                      key={resellerId}
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: i < currentInventory.whitelist.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {reseller?.name ?? resellerId}
                          </Typography>
                          {reseller?.email && (
                            <Typography variant="caption" color="text.secondary">
                              {reseller.email}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                          disabled={whitelistLoading}
                          onClick={() => setRemoveTarget(reseller ?? { _id: resellerId, name: resellerId } as User)}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  )
                })}
              </Stack>
            )}
          </Card>
        </Box>
      )}

      {/* Edit inventory dialog */}
      <Dialog open={editInvOpen} onClose={() => setEditInvOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit inventory</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={invForm.handleSubmit(onEditInvSubmit)} noValidate sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              error={!!invForm.formState.errors.name}
              helperText={invForm.formState.errors.name?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...invForm.register('name', { required: 'Name is required' })}
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={() => setEditInvOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={invLoading}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Save
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Add/Edit item dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit item' : 'Add item'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={itemForm.handleSubmit(onItemSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={1.5}>
              <TextField
                label="Name"
                fullWidth
                required
                error={!!itemForm.formState.errors.name}
                helperText={itemForm.formState.errors.name?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...itemForm.register('name', { required: 'Name is required' })}
              />
              <TextField
                label="Brand"
                fullWidth
                required
                error={!!itemForm.formState.errors.brand}
                helperText={itemForm.formState.errors.brand?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...itemForm.register('brand', { required: 'Brand is required' })}
              />
              <TextField
                label="Serial"
                fullWidth
                required
                error={!!itemForm.formState.errors.serial}
                helperText={itemForm.formState.errors.serial?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...itemForm.register('serial', { required: 'Serial is required' })}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  label="Price"
                  type="number"
                  fullWidth
                  required
                  error={!!itemForm.formState.errors.price}
                  helperText={itemForm.formState.errors.price?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...itemForm.register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be 0 or more' },
                  })}
                />
                <TextField
                  label="Retail Price"
                  type="number"
                  fullWidth
                  required
                  error={!!itemForm.formState.errors.retailPrice}
                  helperText={itemForm.formState.errors.retailPrice?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...itemForm.register('retailPrice', {
                    required: 'Retail price is required',
                    min: { value: 0, message: 'Retail price must be 0 or more' },
                  })}
                />
              </Stack>
            </Stack>
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button
                onClick={() => { setItemDialogOpen(false); setEditItem(null) }}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={itemsLoading}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                {editItem ? 'Save' : 'Add item'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItemTarget}
        title="Delete item"
        message={`Delete "${deleteItemTarget?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onCancel={() => setDeleteItemTarget(null)}
        onConfirm={onDeleteItemConfirm}
      />

      {/* Grant whitelist access dialog */}
      <Dialog open={whitelistDialogOpen} onClose={() => setWhitelistDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grant reseller access</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            select
            label="Reseller"
            value={selectedResellerId}
            onChange={(e) => setSelectedResellerId(e.target.value)}
            fullWidth
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            {allResellers
              .filter((r) => !currentInventory?.whitelist?.includes(r._id))
              .map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.name} — {r.email}
                </MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWhitelistDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedResellerId || whitelistLoading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            onClick={handleAddToWhitelist}
          >
            Grant access
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove from whitelist confirm */}
      <ConfirmDialog
        open={!!removeTarget}
        title="Remove reseller access"
        message={`Remove access for ${removeTarget?.name ?? 'this reseller'}? They will no longer see this inventory.`}
        confirmLabel="Remove"
        confirmColor="error"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleRemoveFromWhitelist}
      />

      {/* Item audit trail dialog */}
      <Dialog open={!!auditItem} onClose={() => setAuditItem(null)} maxWidth="md" fullWidth>
        <DialogTitle>Audit trail — {auditItem?.name ?? ''}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {auditItem && <AuditHistory mode="item" itemId={auditItem._id} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditItem(null)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
