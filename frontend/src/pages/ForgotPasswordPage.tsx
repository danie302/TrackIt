import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import * as authApi from '@/api/auth.api'
import { ROUTES } from '@/router/routes'

interface FormValues {
  email: string
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [apiError, setApiError] = useState('')

  const onSubmit = async (data: FormValues) => {
    setApiError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Box textAlign="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'rgba(76,175,80,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            mx: 'auto',
            mb: 3,
          }}
        >
          📬
        </Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Check your email
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          If an account exists with that address, we've sent a reset code. It expires in 15 minutes.
        </Typography>
        <Button
          component={Link}
          to={ROUTES.RESET_PASSWORD}
          variant="contained"
          fullWidth
          size="large"
          sx={{
            py: 1.4,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(21,101,192,0.3)',
            mb: 2,
          }}
        >
          Enter Reset Code
        </Button>
        <Typography variant="body2" color="text.secondary">
          Didn't receive it?{' '}
          <Box
            component="span"
            onClick={() => setSent(false)}
            sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
          >
            Try again
          </Box>
        </Typography>
      </Box>
    )
  }

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
        🔑
      </Box>

      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Forgot password?
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        No worries — enter your email and we'll send you a reset code.
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
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
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
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Code'}
      </Button>

      <Box textAlign="center">
        <Link
          to={ROUTES.LOGIN}
          style={{ fontSize: 14, color: '#1565C0', textDecoration: 'none', fontWeight: 500 }}
        >
          ← Back to Sign In
        </Link>
      </Box>
    </Box>
  )
}
