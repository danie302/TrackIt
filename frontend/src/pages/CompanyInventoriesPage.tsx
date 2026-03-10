import { useEffect, useCallback, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Alert from '@mui/material/Alert'
import DataTable from '@/components/common/DataTable'
import { useInventoriesStore } from '@/stores/inventories.store'
import { ROUTES } from '@/router/routes'
import type { Inventory } from '@/types/models'

export default function CompanyInventoriesPage() {
  const navigate = useNavigate()
  const { inventories, loading, error, fetchWhitelistedInventories } = useInventoriesStore()

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  const load = useCallback(() => {
    void fetchWhitelistedInventories({ page: page + 1, limit })
  }, [page, limit, fetchWhitelistedInventories])

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(() => ([
    { key: 'name', label: 'Inventory Name', render: (inv: Inventory) => inv.name },
    {
      key: 'actions',
      label: 'Actions',
      width: 130,
      render: (inv: Inventory) => (
        <Button
          size="small"
          variant="contained"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          onClick={(e) => {
            e.stopPropagation()
            navigate(ROUTES.RESELLER_COMPANY_INVENTORY.replace(':inventoryId', inv._id))
          }}
        >
          Browse items
        </Button>
      ),
    },
  ] satisfies Parameters<typeof DataTable<Inventory>>[0]['columns']), [navigate])

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
        <Typography color="text.primary">Company Inventories</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Typography variant="h5" fontWeight={800}>
          Company Inventories
        </Typography>
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
        onLimitChange={(l) => { setLimit(l); setPage(0) }}
        onRowClick={(inv) => navigate(ROUTES.RESELLER_COMPANY_INVENTORY.replace(':inventoryId', inv._id))}
        emptyMessage="No whitelisted company inventories found."
      />
    </Box>
  )
}
