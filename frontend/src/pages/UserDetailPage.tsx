import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
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
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useCompanyUsersStore } from '@/stores/companyUsers.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import { UserRole, type User } from '@/types/models'
import api from '@/api/axios'

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <Stack direction="row" spacing={2} alignItems="baseline">
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value ?? '—'}</Typography>
    </Stack>
  )
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const authUser = useAuthStore((s) => s.user)
  const notify = useUiStore((s) => s.notify)
  const { loading: storeLoading, deactivateUser, activateUser } = useCompanyUsersStore()

  const [pageUser, setPageUser] = useState<User | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  const isCompanyAdmin = authUser?.role === UserRole.COMPANY_ADMIN

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api
      .get<User>(`/users/${id}`)
      .then(({ data }) => {
        setPageUser(data)
        if (data.companyId) {
          api
            .get<{ name: string }>(`/companies/${data.companyId}`)
            .then(({ data: company }) => setCompanyName(company.name))
            .catch(() => setCompanyName(data.companyId ?? null))
        }
      })
      .catch((err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg ?? 'Failed to load user')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleDeactivate = async () => {
    if (!id) return
    try {
      const updated = await deactivateUser(id)
      setPageUser(updated)
      notify('User deactivated', 'success')
      setConfirmOpen(false)
    } catch {
      // store handles error
    }
  }

  const handleActivate = async () => {
    if (!id) return
    try {
      const updated = await activateUser(id)
      setPageUser(updated)
      notify('User activated', 'success')
      setActivateOpen(false)
    } catch {
      // store handles error
    }
  }

  if (!id) {
    return <Alert severity="error">Invalid user id</Alert>
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
          to={ROUTES.USERS}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Users
        </Button>
        <Typography color="text.primary">{pageUser?.name ?? 'User'}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : pageUser ? (
        <Card elevation={1} sx={{ borderRadius: 3, maxWidth: 600 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>{pageUser.name}</Typography>
                <Chip
                  size="small"
                  label={pageUser.isActive ? 'Active' : 'Inactive'}
                  color={pageUser.isActive ? 'success' : 'default'}
                  variant={pageUser.isActive ? 'filled' : 'outlined'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              {isCompanyAdmin && (
                pageUser.isActive ? (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    onClick={() => setConfirmOpen(true)}
                    disabled={storeLoading}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    onClick={() => setActivateOpen(true)}
                    disabled={storeLoading}
                  >
                    Activate
                  </Button>
                )
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <InfoRow label="Email" value={pageUser.email} />
              <InfoRow label="Username" value={pageUser.username} />
              <InfoRow label="Role" value={pageUser.role} />
              <InfoRow label="Phone" value={pageUser.cel} />
              <InfoRow label="DNI" value={`${pageUser.typeOfDni} — ${pageUser.dni}`} />
              <InfoRow label="Company" value={companyName ?? pageUser.companyId} />
              <InfoRow label="Created" value={pageUser.createdAt ? new Date(pageUser.createdAt).toLocaleDateString() : '—'} />
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate user"
        message={`Deactivate ${pageUser?.name ?? 'this user'}? They will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        confirmColor="error"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeactivate}
      />

      <ConfirmDialog
        open={activateOpen}
        title="Activate user"
        message={`Activate ${pageUser?.name ?? 'this user'}? They will be able to sign in again.`}
        confirmLabel="Activate"
        confirmColor="success"
        onCancel={() => setActivateOpen(false)}
        onConfirm={handleActivate}
      />
    </Box>
  )
}
