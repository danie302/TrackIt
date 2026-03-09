import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DataTable from '@/components/common/DataTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useCompanyStore } from '@/stores/company.store'
import { useCompanyUsersStore } from '@/stores/companyUsers.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import { DniType, UserRole, type User } from '@/types/models'

interface CompanyEditValues {
  name: string
  nit: string
  description?: string
  logo?: string
}

interface CreateUserValues {
  name: string
  email: string
  username: string
  password: string
  cel: string
  dni: string
  typeOfDni: DniType
  role: UserRole
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

function formatDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString()
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const notify = useUiStore((s) => s.notify)

  const { currentCompany, loading: companyLoading, error: companyError, fetchCompanyById, updateCompany } = useCompanyStore()
  const {
    users,
    loading: usersLoading,
    error: usersError,
    roleFilter,
    setRoleFilter,
    fetchCompanyUsers,
    createUser,
    deactivateUser,
  } = useCompanyUsersStore()

  const [editMode, setEditMode] = useState(false)
  const [userPage, setUserPage] = useState(0)
  const [userLimit, setUserLimit] = useState(10)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors: companyErrors } } = useForm<CompanyEditValues>()
  const userForm = useForm<CreateUserValues>({
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      cel: '',
      dni: '',
      typeOfDni: DniType.CC,
      role: UserRole.COMPANY_ADMIN,
    },
  })

  useEffect(() => {
    if (!id) return
    void fetchCompanyById(id)
  }, [id, fetchCompanyById])

  useEffect(() => {
    if (!id) return
    void fetchCompanyUsers(id, { page: userPage + 1, limit: userLimit })
  }, [id, userPage, userLimit, roleFilter, fetchCompanyUsers])

  useEffect(() => {
    if (!currentCompany) return
    reset({
      name: currentCompany.name ?? '',
      nit: currentCompany.nit ?? '',
      description: currentCompany.description ?? '',
      logo: currentCompany.logo ?? '',
    })
  }, [currentCompany, reset])

  const onSaveCompany = async (values: CompanyEditValues) => {
    if (!id) return
    try {
      await updateCompany(id, {
        name: values.name.trim(),
        nit: values.nit.trim().toUpperCase(),
        description: values.description?.trim() ? values.description.trim() : undefined,
        logo: values.logo?.trim() ? values.logo.trim() : undefined,
      })
      notify('Company updated', 'success')
      setEditMode(false)
    } catch {
      // store handles error
    }
  }

  const userColumns = useMemo(() => ([
    { key: 'name', label: 'Name', render: (u: User) => u.name },
    { key: 'email', label: 'Email', render: (u: User) => u.email },
    { key: 'role', label: 'Role', width: 150, render: (u: User) => u.role },
    {
      key: 'isActive',
      label: 'Status',
      width: 120,
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
      width: 120,
      render: (u: User) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={u.isActive ? 'Deactivate user' : 'User is already inactive'}>
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={!u.isActive}
                onClick={(e) => {
                  e.stopPropagation()
                  setTargetUser(u)
                  setConfirmOpen(true)
                }}
              >
                <span style={{ fontSize: 16 }}>⛔</span>
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ),
    },
  ]) satisfies Parameters<typeof DataTable<User>>[0]['columns'], [])

  if (!id) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Invalid company id
      </Alert>
    )
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to={ROUTES.MASTER_ADMIN_COMPANIES}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Companies
        </Button>
        <Typography color="text.primary">{currentCompany?.name ?? 'Company'}</Typography>
      </Breadcrumbs>

      {companyError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {companyError}
        </Alert>
      )}

      <Card elevation={1} sx={{ borderRadius: 3, mb: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center" flex={1}>
              <Avatar
                src={currentCompany?.logo}
                sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800 }}
              >
                {(currentCompany?.name ?? 'C').slice(0, 1).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {currentCompany?.name ?? '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  NIT: {currentCompany?.nit ?? '—'} {typeof currentCompany?.userCount === 'number' ? `• Users: ${currentCompany.userCount}` : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(currentCompany?.createdAt)}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant={editMode ? 'outlined' : 'contained'}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                onClick={() => setEditMode((v) => !v)}
                disabled={companyLoading || !currentCompany}
              >
                {editMode ? 'Cancel edit' : 'Edit company'}
              </Button>
            </Stack>
          </Stack>

          {companyLoading && (
            <Box mt={2} display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          )}

          {editMode && currentCompany && (
            <Box component="form" onSubmit={handleSubmit(onSaveCompany)} mt={2} noValidate>
              <Stack spacing={1.5}>
                <TextField
                  label="Company name"
                  fullWidth
                  error={!!companyErrors.name}
                  helperText={companyErrors.name?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('name', { required: 'Company name is required' })}
                />
                <TextField
                  label="NIT"
                  fullWidth
                  error={!!companyErrors.nit}
                  helperText={companyErrors.nit?.message ?? 'Uppercase letters and numbers only'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('nit', {
                    required: 'NIT is required',
                    validate: (val) => /^[A-Z0-9]+$/.test(val.trim().toUpperCase()) || 'NIT must be uppercase letters and numbers only',
                  })}
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={2}
                  error={!!companyErrors.description}
                  helperText={companyErrors.description?.message ?? 'Optional, max 500 characters'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                />
                <TextField
                  label="Logo URL"
                  fullWidth
                  error={!!companyErrors.logo}
                  helperText={companyErrors.logo?.message ?? 'Optional'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('logo')}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, minWidth: 160 }}
                    disabled={companyLoading}
                  >
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    disabled={companyLoading}
                    onClick={() => {
                      reset({
                        name: currentCompany.name ?? '',
                        nit: currentCompany.nit ?? '',
                        description: currentCompany.description ?? '',
                        logo: currentCompany.logo ?? '',
                      })
                      setEditMode(false)
                    }}
                  >
                    Discard
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users in this company
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | 'ALL')
              setUserPage(0)
            }}
            sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value={UserRole.COMPANY_ADMIN}>Company Admin</MenuItem>
            <MenuItem value={UserRole.EMPLOYER}>Employer</MenuItem>
            <MenuItem value={UserRole.RESELLER}>Reseller</MenuItem>
          </TextField>
          <Button
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            onClick={() => setUserDialogOpen(true)}
          >
            Add user
          </Button>
        </Stack>
      </Stack>

      {usersError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {usersError}
        </Alert>
      )}

      <DataTable<User>
        columns={userColumns}
        data={users.data}
        total={users.total}
        page={userPage}
        limit={userLimit}
        loading={usersLoading}
        onPageChange={setUserPage}
        onLimitChange={(l) => {
          setUserLimit(l)
          setUserPage(0)
        }}
        emptyMessage="No users found for this company."
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate user"
        message={`Deactivate ${targetUser?.name ?? 'this user'}? They will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        confirmColor="error"
        onCancel={() => {
          setConfirmOpen(false)
          setTargetUser(null)
        }}
        onConfirm={async () => {
          if (!targetUser) return
          try {
            await deactivateUser(targetUser._id)
            notify('User deactivated', 'success')
            setConfirmOpen(false)
            setTargetUser(null)
            await fetchCompanyUsers(id, { page: userPage + 1, limit: userLimit })
          } catch {
            // store handles error
          }
        }}
      />

      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add user</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={userForm.handleSubmit(async (vals) => {
            try {
              await createUser({
                ...vals,
                email: vals.email.trim(),
                username: vals.username.trim(),
                companyId: id,
              })
              notify('User created', 'success')
              setUserDialogOpen(false)
              userForm.reset()
              await Promise.all([
                fetchCompanyUsers(id, { page: 1, limit: userLimit }),
                fetchCompanyById(id),
              ])
              setUserPage(0)
            } catch {
              // store handles error
            }
          })} noValidate sx={{ mt: 1 }}>
            <Stack spacing={1.5}>
              <TextField
                label="Full name"
                fullWidth
                error={!!userForm.formState.errors.name}
                helperText={userForm.formState.errors.name?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...userForm.register('name', { required: 'Name is required' })}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                error={!!userForm.formState.errors.email}
                helperText={userForm.formState.errors.email?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...userForm.register('email', { required: 'Email is required' })}
              />
              <TextField
                label="Username"
                fullWidth
                error={!!userForm.formState.errors.username}
                helperText={userForm.formState.errors.username?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...userForm.register('username', { required: 'Username is required' })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                error={!!userForm.formState.errors.password}
                helperText={userForm.formState.errors.password?.message ?? 'Min 8 chars, upper/lower/number/special (@$!%*?&)'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...userForm.register('password', {
                  required: 'Password is required',
                  validate: (v) => PASSWORD_PATTERN.test(v) || 'Password does not meet requirements',
                })}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  label="Phone"
                  fullWidth
                  error={!!userForm.formState.errors.cel}
                  helperText={userForm.formState.errors.cel?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...userForm.register('cel', { required: 'Phone is required' })}
                />
                <TextField
                  label="DNI"
                  fullWidth
                  error={!!userForm.formState.errors.dni}
                  helperText={userForm.formState.errors.dni?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...userForm.register('dni', { required: 'DNI is required' })}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  label="DNI type"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...userForm.register('typeOfDni', { required: true })}
                >
                  {Object.values(DniType).map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Role"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...userForm.register('role', { required: true })}
                >
                  <MenuItem value={UserRole.COMPANY_ADMIN}>Company Admin</MenuItem>
                  <MenuItem value={UserRole.EMPLOYER}>Employer</MenuItem>
                  <MenuItem value={UserRole.RESELLER}>Reseller</MenuItem>
                </TextField>
              </Stack>
            </Stack>

            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button
                onClick={() => {
                  setUserDialogOpen(false)
                  userForm.reset()
                }}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                disabled={usersLoading}
              >
                Create user
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
