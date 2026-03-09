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
  const [showPassword, setShowPassword] = useState(false)

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

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: 'rgba(21,101,192,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          mb: 2,
        }}
      >
        🛡️
      </Box>

      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Reset your password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter the 6-digit code from your email and choose a new password.
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
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        sx={fieldSx}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
        })}
      />

      <TextField
        label="Reset code"
        fullWidth
        margin="normal"
        placeholder="••••••"
        error={!!errors.otp}
        helperText={errors.otp?.message}
        sx={{
          ...fieldSx,
          '& input': { letterSpacing: 6, fontSize: 22, fontWeight: 700, textAlign: 'center' },
        }}
        slotProps={{ htmlInput: { maxLength: 6 } }}
        {...register('otp', {
          required: 'Reset code is required',
          minLength: { value: 6, message: 'Enter the 6-digit code' },
          maxLength: { value: 6, message: 'Code must be 6 digits' },
        })}
      />

      <TextField
        label="New password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message}
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
        {...register('newPassword', {
          required: 'New password is required',
          pattern: {
            value: PASSWORD_PATTERN,
            message: 'Min 8 chars with uppercase, lowercase, number & special character',
          },
        })}
      />

      <TextField
        label="Confirm new password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        sx={fieldSx}
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
        sx={{
          mt: 2,
          mb: 3,
          py: 1.4,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 15,
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(21,101,192,0.3)',
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
      </Button>

      <Box textAlign="center">
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          style={{ fontSize: 14, color: '#1565C0', textDecoration: 'none', fontWeight: 500 }}
        >
          Resend reset code
        </Link>
      </Box>
    </Box>
  )
}
