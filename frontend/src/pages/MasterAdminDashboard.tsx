import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useCompanyStore } from '@/stores/company.store'
import DataTable from '@/components/common/DataTable'
import { ROUTES } from '@/router/routes'
import type { Company } from '@/types/models'

type SortBy = 'createdAt' | 'name'
type SortDir = 'asc' | 'desc'

function formatDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}

export default function MasterAdminDashboard() {
  const navigate = useNavigate()
  const { companies, loading, error, fetchCompanies } = useCompanyStore()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchCompanies({
        page: page + 1,
        limit,
        search: search.trim() ? search.trim() : undefined,
        sortBy,
        sortDir,
      })
    }, 250)

    return () => window.clearTimeout(t)
  }, [page, limit, search, sortBy, sortDir, fetchCompanies])

  const columns = useMemo(() => ([
    {
      key: 'logo',
      label: 'Logo',
      width: 80,
      render: (row: Company) => (
        <Avatar
          src={row.logo}
          alt={row.name}
          sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700 }}
        >
          {(row.name ?? '?').slice(0, 1).toUpperCase()}
        </Avatar>
      ),
    },
    { key: 'name', label: 'Name', render: (row: Company) => row.name },
    {
      key: 'description',
      label: 'Description',
      render: (row: Company) => row.description ?? '—',
    },
    {
      key: 'userCount',
      label: 'Users',
      width: 90,
      render: (row: Company) => String(row.userCount ?? 0),
    },
    {
      key: 'createdAt',
      label: 'Created',
      width: 130,
      render: (row: Company) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 120,
      render: (row: Company) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`${ROUTES.MASTER_ADMIN_COMPANY_DETAIL.replace(':id', row._id)}`)
              }}
            >
              <span style={{ fontSize: 16 }}>↗</span>
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]) satisfies Parameters<typeof DataTable<Company>>[0]['columns'], [navigate])

  return (
    <Box>
      <Box
        display="flex"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        gap={2}
        mb={2.5}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Companies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage companies across the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          onClick={() => navigate(ROUTES.MASTER_ADMIN_COMPANY_CREATE)}
        >
          Create Company
        </Button>
      </Box>

      <Box display="flex" gap={1} flexDirection={{ xs: 'column', sm: 'row' }} mb={2}>
        <TextField
          label="Search companies"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <TextField
          select
          label="Sort"
          value={`${sortBy}:${sortDir}`}
          onChange={(e) => {
            const [sb, sd] = String(e.target.value).split(':') as [SortBy, SortDir]
            setSortBy(sb)
            setSortDir(sd)
            setPage(0)
          }}
          sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          slotProps={{ select: { native: true } }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="name:asc">Name (A–Z)</option>
          <option value="name:desc">Name (Z–A)</option>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable<Company>
        columns={columns}
        data={companies.data}
        total={companies.total}
        page={page}
        limit={limit}
        loading={loading}
        emptyMessage="No companies found. Create your first company."
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l)
          setPage(0)
        }}
        onRowClick={(row) => navigate(`${ROUTES.MASTER_ADMIN_COMPANY_DETAIL.replace(':id', row._id)}`)}
      />
    </Box>
  )
}
