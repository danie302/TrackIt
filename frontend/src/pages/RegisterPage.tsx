import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import * as authApi from '@/api/auth.api'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import { DniType } from '@/types/models'

interface FormValues {
  name: string
  email: string
  username: string
  password: string
  confirmPassword: string
  cel: string
  dni: string
  typeOfDni: string
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'grey.300' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z\d]/.test(password)) score++
  if (score <= 2) return { score: (score / 5) * 100, label: 'Weak', color: '#f44336' }
  if (score <= 3) return { score: (score / 5) * 100, label: 'Fair', color: '#ff9800' }
  if (score === 4) return { score: (score / 5) * 100, label: 'Good', color: '#2196f3' }
  return { score: 100, label: 'Strong', color: '#4caf50' }
}

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { typeOfDni: DniType.CC },
  })
  const navigate = useNavigate()
  const notify = useUiStore((s) => s.notify)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const password = watch('password', '')
  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data: FormValues) => {
    setApiError('')
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirm, ...payload } = data
      await authApi.register({ ...payload, role: 'Reseller' })
      notify('Account created successfully! Please sign in.', 'success')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={700} color="text.primary" mb={0.5}>
        Create account
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Join TrackIt to start managing your inventory
      </Typography>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {apiError}
        </Alert>
      )}

      <TextField
        label="Full name"
        fullWidth
        margin="normal"
        autoFocus
        error={!!errors.name}
        helperText={errors.name?.message}
        sx={fieldSx}
        {...register('name', { required: 'Full name is required' })}
      />

      <TextField
        label="Email address"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        sx={fieldSx}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
        })}
      />

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        error={!!errors.username}
        helperText={errors.username?.message}
        sx={fieldSx}
        {...register('username', {
          required: 'Username is required',
          minLength: { value: 3, message: 'At least 3 characters' },
          pattern: { value: /^\S+$/, message: 'No spaces allowed' },
        })}
      />

      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
        sx={fieldSx}
        slotProps={{
          input: {
            endAdornment: (
              <Box
                component="span"
                onClick={() => setShowPassword((v) => !v)}
                sx={{ cursor: 'pointer', fontSize: 13, color: 'text.secondary', pr: 1, userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Box>
            ),
          },
        }}
        {...register('password', {
          required: 'Password is required',
          pattern: {
            value: PASSWORD_PATTERN,
            message: 'Min 8 chars with uppercase, lowercase, number & special character',
          },
        })}
      />

      {/* Password strength bar */}
      {password && (
        <Box mb={1}>
          <LinearProgress
            variant="determinate"
            value={passwordStrength.score}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': { bgcolor: passwordStrength.color, borderRadius: 2 },
            }}
          />
          <Typography variant="caption" sx={{ color: passwordStrength.color }}>
            {passwordStrength.label}
          </Typography>
        </Box>
      )}

      <TextField
        label="Confirm password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        sx={fieldSx}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (val) => val === password || 'Passwords do not match',
        })}
      />

      <TextField
        label="Phone number"
        fullWidth
        margin="normal"
        error={!!errors.cel}
        helperText={errors.cel?.message}
        sx={fieldSx}
        {...register('cel', { required: 'Phone number is required' })}
      />

      <Box display="flex" gap={2} mt={1}>
        <TextField
          select
          label="ID Type"
          sx={{ ...fieldSx, width: 140, flexShrink: 0 }}
          defaultValue={DniType.CC}
          error={!!errors.typeOfDni}
          {...register('typeOfDni', { required: true })}
        >
          {Object.values(DniType).map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="ID Number"
          fullWidth
          error={!!errors.dni}
          helperText={errors.dni?.message}
          sx={fieldSx}
          {...register('dni', { required: 'ID number is required' })}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{
          mt: 3,
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
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
      </Button>

      <Divider sx={{ mb: 2 }} />

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            style={{ color: '#1565C0', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
