import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import * as authApi from '@/api/auth.api'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'

interface FormValues {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export default function ResetPasswordPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>()
  const navigate = useNavigate()
  const notify = useUiStore((s) => s.notify)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const newPassword = watch('newPassword')

  const onSubmit = async (data: FormValues) => {
    setApiError('')
    setLoading(true)
    try {
      await authApi.resetPassword(data.email, data.otp, data.newPassword)
      notify('Password reset successfully. Please sign in.', 'success')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiError(msg ?? 'Reset failed. The code may be expired or invalid.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter the code sent to your email and choose a new password.
      </Typography>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
        })}
      />

      <TextField
        label="Reset Code"
        fullWidth
        margin="normal"
        inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: 20 } }}
        error={!!errors.otp}
        helperText={errors.otp?.message}
        {...register('otp', {
          required: 'Reset code is required',
          minLength: { value: 6, message: 'Enter the 6-digit code' },
        })}
      />

      <TextField
        label="New Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message ?? 'Min 8 chars, uppercase, lowercase, number, special character'}
        {...register('newPassword', {
          required: 'New password is required',
          pattern: {
            value: PASSWORD_PATTERN,
            message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
          },
        })}
      />

      <TextField
        label="Confirm New Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (val) => val === newPassword || 'Passwords do not match',
        })}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
      </Button>

      <Box textAlign="center">
        <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: 14 }}>
          Resend reset code
        </Link>
      </Box>
    </Box>
  )
}
