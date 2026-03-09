import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import { UserRole } from '@/types/models'

interface FormValues {
  email: string
  password: string
}

function getRoleRedirect(role: string): string {
  switch (role as UserRole) {
    case UserRole.MASTER_ADMIN: return ROUTES.MASTER_ADMIN_DASHBOARD
    case UserRole.COMPANY_ADMIN:
    case UserRole.EMPLOYER: return ROUTES.COMPANY_ADMIN_DASHBOARD
    case UserRole.RESELLER: return ROUTES.RESELLER_DASHBOARD
    default: return ROUTES.DASHBOARD
  }
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: FormValues) => {
    setApiError('')
    setLoading(true)
    try {
      await login(data.email, data.password)
      const user = useAuthStore.getState().user
      navigate(user ? getRoleRedirect(user.role) : ROUTES.DASHBOARD, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiError(msg ?? 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Sign In
      </Typography>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        autoComplete="email"
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
        })}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register('password', { required: 'Password is required' })}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
      </Button>

      <Box display="flex" justifyContent="space-between">
        <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: 14 }}>
          Forgot password?
        </Link>
        <Link to={ROUTES.REGISTER} style={{ fontSize: 14 }}>
          Create account
        </Link>
      </Box>
    </Box>
  )
}
