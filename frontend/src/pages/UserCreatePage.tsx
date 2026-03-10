import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import { useCompanyUsersStore } from '@/stores/companyUsers.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import { DniType, UserRole } from '@/types/models'
import type { CreateUserPayload } from '@/api/users.api'

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export default function UserCreatePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const notify = useUiStore((s) => s.notify)
  const { loading, error, createUser } = useCompanyUsersStore()

  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserPayload>({
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      cel: '',
      dni: '',
      typeOfDni: DniType.CC,
      role: UserRole.EMPLOYER,
    },
  })

  const onSubmit = async (values: CreateUserPayload) => {
    if (!user?.companyId) return
    try {
      await createUser({
        ...values,
        email: values.email.trim(),
        username: values.username.trim(),
        companyId: user.companyId,
      })
      notify('User created successfully', 'success')
      navigate(ROUTES.USERS)
    } catch {
      // store handles error
    }
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
        <Typography color="text.primary">New User</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={800} mb={3}>
        New User
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card elevation={1} sx={{ borderRadius: 3, maxWidth: 600 }}>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Full name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...register('name', { required: 'Name is required' })}
              />

              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...register('email', { required: 'Email is required' })}
              />

              <TextField
                label="Username"
                fullWidth
                required
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...register('username', { required: 'Username is required' })}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password?.message ?? 'Min 8 chars, upper/lower/number/special (@$!%*?&)'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...register('password', {
                  required: 'Password is required',
                  validate: (v) => PASSWORD_PATTERN.test(v) || 'Password does not meet requirements',
                })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Phone"
                  fullWidth
                  required
                  error={!!errors.cel}
                  helperText={errors.cel?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('cel', { required: 'Phone is required' })}
                />
                <TextField
                  label="DNI"
                  fullWidth
                  required
                  error={!!errors.dni}
                  helperText={errors.dni?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('dni', { required: 'DNI is required' })}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="DNI type"
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('typeOfDni', { required: true })}
                >
                  {Object.values(DniType).map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Role"
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  {...register('role', { required: true })}
                >
                  <MenuItem value={UserRole.COMPANY_ADMIN}>Company Admin</MenuItem>
                  <MenuItem value={UserRole.EMPLOYER}>Employer</MenuItem>
                  <MenuItem value={UserRole.RESELLER}>Reseller</MenuItem>
                </TextField>
              </Stack>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" pt={1}>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  onClick={() => navigate(ROUTES.USERS)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Create user
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
