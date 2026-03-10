import { useEffect, useCallback, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Alert from '@mui/material/Alert'
import Checkbox from '@mui/material/Checkbox'
import DataTable from '@/components/common/DataTable'
import { useItemsStore } from '@/stores/items.store'
import { useInventoriesStore } from '@/stores/inventories.store'
import { ROUTES } from '@/router/routes'
import type { Item } from '@/types/models'

export default function CompanyInventoryItemsPage() {
  const { inventoryId } = useParams<{ inventoryId: string }>()
  const navigate = useNavigate()
  const { currentInventory, fetchInventoryById } = useInventoriesStore()
  const { items, loading, error, fetchItems } = useItemsStore()

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<string[]>([])

  const loadInventory = useCallback(() => {
    if (!inventoryId) return
    void fetchInventoryById(inventoryId)
  }, [inventoryId, fetchInventoryById])

  const loadItems = useCallback(() => {
    if (!inventoryId) return
    void fetchItems(inventoryId, { page: page + 1, limit })
  }, [inventoryId, page, limit, fetchItems])

  useEffect(() => { loadInventory() }, [loadInventory])
  useEffect(() => { loadItems() }, [loadItems])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const handleCreateOrder = () => {
    if (!inventoryId || selected.length === 0) return
    navigate(ROUTES.RESELLER_ORDER_CREATE, {
      state: { selectedItemIds: selected, sourceInventoryId: inventoryId },
    })
  }

  const columns = useMemo(() => ([
    {
      key: 'select',
      label: '',
      width: 48,
      render: (item: Item) => (
        <Checkbox
          size="small"
          checked={selected.includes(item._id)}
          onChange={() => toggleSelect(item._id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    { key: 'serial', label: 'Serial', render: (item: Item) => item.serial },
    { key: 'name', label: 'Name', render: (item: Item) => item.name },
    { key: 'brand', label: 'Brand', render: (item: Item) => item.brand },
    { key: 'price', label: 'Price', render: (item: Item) => `$${item.price}` },
  ] satisfies Parameters<typeof DataTable<Item>>[0]['columns']), [selected])

  if (!inventoryId) {
    return <Alert severity="error">Invalid inventory id</Alert>
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
        <Typography color="text.primary">{currentInventory?.name ?? 'Inventory'}</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {currentInventory?.name ?? '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select items to request
          </Typography>
        </Box>
        <Button
          variant="contained"
          disabled={selected.length === 0}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          onClick={handleCreateOrder}
        >
          Request items ({selected.length})
        </Button>
      </Stack>

      {selected.length > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {selected.length} item{selected.length > 1 ? 's' : ''} selected — click "Request items" to create an order.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable<Item>
        columns={columns}
        data={items.data}
        total={items.total}
        page={page}
        limit={limit}
        loading={loading}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(0) }}
        emptyMessage="No items in this inventory."
      />
    </Box>
  )
}
