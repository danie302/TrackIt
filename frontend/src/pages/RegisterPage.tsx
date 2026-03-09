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

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>()
  const navigate = useNavigate()
  const notify = useUiStore((s) => s.notify)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const password = watch('password')

  const onSubmit = async (data: FormValues) => {
    setApiError('')
    setLoading(true)
    try {
      const { confirmPassword: _, ...payload } = data
      await authApi.register({ ...payload, role: 'Reseller' })
      notify('Account created! Please sign in.', 'success')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Create Account
      </Typography>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

      <TextField
        label="Full Name"
        fullWidth
        margin="normal"
        autoFocus
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register('name', { required: 'Full name is required' })}
      />

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
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
        {...register('username', {
          required: 'Username is required',
          minLength: { value: 3, message: 'Username must be at least 3 characters' },
        })}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message ?? 'Min 8 chars, uppercase, lowercase, number, special character'}
        {...register('password', {
          required: 'Password is required',
          pattern: {
            value: PASSWORD_PATTERN,
            message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
          },
        })}
      />

      <TextField
        label="Confirm Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (val) => val === password || 'Passwords do not match',
        })}
      />

      <TextField
        label="Phone"
        fullWidth
        margin="normal"
        error={!!errors.cel}
        helperText={errors.cel?.message}
        {...register('cel', { required: 'Phone number is required' })}
      />

      <Box display="flex" gap={2} mt={1}>
        <TextField
          select
          label="ID Type"
          fullWidth
          defaultValue="CC"
          error={!!errors.typeOfDni}
          helperText={errors.typeOfDni?.message}
          {...register('typeOfDni', { required: 'ID type is required' })}
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
          {...register('dni', { required: 'ID number is required' })}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
      </Button>

      <Box textAlign="center">
        <Link to={ROUTES.LOGIN} style={{ fontSize: 14 }}>
          Already have an account? Sign in
        </Link>
      </Box>
    </Box>
  )
}
