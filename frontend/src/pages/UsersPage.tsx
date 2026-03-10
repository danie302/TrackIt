import { useEffect, useCallback, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import DataTable from '@/components/common/DataTable'
import { useCompanyUsersStore } from '@/stores/companyUsers.store'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import { UserRole, type User } from '@/types/models'

export default function UsersPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { users, loading, error, roleFilter, setRoleFilter, fetchCompanyUsers } = useCompanyUsersStore()

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  const load = useCallback(() => {
    if (!user?.companyId) return
    void fetchCompanyUsers(user.companyId, { page: page + 1, limit })
  }, [user?.companyId, page, limit, roleFilter, fetchCompanyUsers])

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(() => ([
    { key: 'name', label: 'Name', render: (u: User) => u.name },
    { key: 'email', label: 'Email', render: (u: User) => u.email },
    { key: 'role', label: 'Role', width: 160, render: (u: User) => u.role },
    {
      key: 'isActive',
      label: 'Status',
      width: 110,
      render: (u: User) => (
        <Chip
          size="small"
          label={u.isActive ? 'Active' : 'Inactive'}
          color={u.isActive ? 'success' : 'default'}
          variant={u.isActive ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 100,
      render: (u: User) => (
        <Button
          size="small"
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none' }}
          onClick={(e) => {
            e.stopPropagation()
            navigate(ROUTES.USER_DETAIL.replace(':id', u._id))
          }}
        >
          View
        </Button>
      ),
    },
  ] satisfies Parameters<typeof DataTable<User>>[0]['columns']), [navigate])

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
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Typography variant="h5" fontWeight={800}>
          Users
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | 'ALL')
              setPage(0)
            }}
            sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            size="small"
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value={UserRole.COMPANY_ADMIN}>Company Admin</MenuItem>
            <MenuItem value={UserRole.EMPLOYER}>Employer</MenuItem>
            <MenuItem value={UserRole.RESELLER}>Reseller</MenuItem>
          </TextField>
          <Button
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            onClick={() => navigate(ROUTES.USER_CREATE)}
          >
            Add user
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable<User>
        columns={columns}
        data={users.data}
        total={users.total}
        page={page}
        limit={limit}
        loading={loading}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(0) }}
        onRowClick={(u) => navigate(ROUTES.USER_DETAIL.replace(':id', u._id))}
        emptyMessage="No users found."
      />
    </Box>
  )
}
