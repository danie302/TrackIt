import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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

export default function MyInventoryPage() {
  const navigate = useNavigate()
  const { inventories, fetchResellerInventories } = useInventoriesStore()
  const { items, loading, error, fetchItems } = useItemsStore()

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<string[]>([])

  const resellerInventory = inventories.data.length > 0 ? inventories.data[0] : null

  useEffect(() => {
    void fetchResellerInventories()
  }, [fetchResellerInventories])

  useEffect(() => {
    if (!resellerInventory?._id) return
    void fetchItems(resellerInventory._id, { page: page + 1, limit })
  }, [resellerInventory?._id, page, limit, fetchItems])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const handleCreateDevolution = () => {
    if (!resellerInventory || selected.length === 0) return
    navigate(ROUTES.RESELLER_DEVOLUTION_CREATE, {
      state: { selectedItemIds: selected, sourceInventoryId: resellerInventory._id },
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
        <Typography color="text.primary">My Inventory</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Typography variant="h5" fontWeight={800}>
          My Inventory
        </Typography>
        <Button
          variant="contained"
          color="warning"
          disabled={selected.length === 0}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          onClick={handleCreateDevolution}
        >
          Return items ({selected.length})
        </Button>
      </Stack>

      {selected.length > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {selected.length} item{selected.length > 1 ? 's' : ''} selected — click "Return items" to create a devolution order.
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
        emptyMessage="Your inventory is empty."
      />
    </Box>
  )
}
