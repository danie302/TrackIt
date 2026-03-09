import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
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
  const [showPassword, setShowPassword] = useState(false)

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
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={0.5}>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Sign in to your TrackIt account
      </Typography>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {apiError}
        </Alert>
      )}

      <TextField
        label="Email address"
        type="email"
        fullWidth
        margin="normal"
        autoComplete="email"
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <span style={{ fontSize: 16 }}>✉️</span>
              </InputAdornment>
            ),
          },
        }}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
        })}
      />

      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <span style={{ fontSize: 16 }}>🔒</span>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box
                  component="span"
                  onClick={() => setShowPassword((v) => !v)}
                  sx={{ cursor: 'pointer', fontSize: 14, color: 'text.secondary', userSelect: 'none' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Box>
              </InputAdornment>
            ),
          },
        }}
        {...register('password', { required: 'Password is required' })}
      />

      <Box display="flex" justifyContent="flex-end" mt={0.5} mb={1}>
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          style={{ fontSize: 13, color: '#1565C0', textDecoration: 'none' }}
        >
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{
          mt: 1,
          mb: 3,
          py: 1.4,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 15,
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(21,101,192,0.3)',
          '&:hover': { boxShadow: '0 6px 16px rgba(21,101,192,0.4)' },
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
      </Button>

      <Divider sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          New to TrackIt?
        </Typography>
      </Divider>

      <Button
        component={Link}
        to={ROUTES.REGISTER}
        variant="outlined"
        fullWidth
        size="large"
        sx={{
          py: 1.4,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 15,
          textTransform: 'none',
          borderColor: 'rgba(21,101,192,0.3)',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(21,101,192,0.04)' },
        }}
      >
        Create an account
      </Button>
    </Box>
  )
}
