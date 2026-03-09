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
      <Box>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Check Your Email
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          If an account exists with that email, a reset code has been sent.
        </Alert>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter the code along with your new password on the next screen.
        </Typography>
        <Button
          component={Link}
          to={ROUTES.RESET_PASSWORD}
          variant="contained"
          fullWidth
          size="large"
        >
          Enter Reset Code
        </Button>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your email and we'll send you a reset code.
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

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
      </Button>

      <Box textAlign="center">
        <Link to={ROUTES.LOGIN} style={{ fontSize: 14 }}>
          Back to Sign In
        </Link>
      </Box>
    </Box>
  )
}
