import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import { useCompanyStore } from '@/stores/company.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'

interface FormValues {
  name: string
  nit: string
  description?: string
  logo?: string
}

const NIT_PATTERN = /^[A-Z0-9]+$/

export default function CompanyCreatePage() {
  const navigate = useNavigate()
  const notify = useUiStore((s) => s.notify)
  const { createCompany, loading, error } = useCompanyStore()
  const [logoPreview, setLogoPreview] = useState('')
  const [namePreview, setNamePreview] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', nit: '', description: '', logo: '' },
  })

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name.trim(),
      nit: data.nit.trim().toUpperCase(),
      description: data.description?.trim() ? data.description.trim() : undefined,
      logo: data.logo?.trim() ? data.logo.trim() : undefined,
    }
    try {
      const company = await createCompany(payload)
      notify('Company created successfully', 'success')
      navigate(ROUTES.MASTER_ADMIN_COMPANY_DETAIL.replace(':id', company._id), { replace: true })
    } catch {
      // store handles error
    }
  }

  return (
    <Box>
      <Box mb={2.5}>
        <Typography variant="h5" fontWeight={800} mb={0.5}>
          Create company
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new company to TrackIt
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card elevation={1} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar
                src={logoPreview || undefined}
                sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800 }}
              >
                {(namePreview || 'C').slice(0, 1).toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontWeight={700}>Logo preview</Typography>
                <Typography variant="body2" color="text.secondary">
                  For now, use an image URL. File upload comes in Phase 14.
                </Typography>
              </Box>
            </Stack>

            <TextField
              label="Company name"
              fullWidth
              margin="normal"
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...register('name', {
                required: 'Company name is required',
                onChange: (e) => setNamePreview(String(e.target.value ?? '')),
              })}
            />

            <TextField
              label="NIT"
              fullWidth
              margin="normal"
              error={!!errors.nit}
              helperText={errors.nit?.message ?? 'Uppercase letters and numbers only'}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...register('nit', {
                required: 'NIT is required',
                validate: (val) => {
                  const v = val.trim().toUpperCase()
                  return NIT_PATTERN.test(v) || 'NIT must be uppercase letters and numbers only'
                },
              })}
              onChange={(e) => setValue('nit', e.target.value.toUpperCase(), { shouldValidate: true })}
            />

            <TextField
              label="Description (optional)"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              error={!!errors.description}
              helperText={errors.description?.message ?? 'Max 500 characters'}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...register('description', {
                maxLength: { value: 500, message: 'Max 500 characters' },
              })}
            />

            <TextField
              label="Logo URL (optional)"
              fullWidth
              margin="normal"
              error={!!errors.logo}
              helperText={errors.logo?.message}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...register('logo', {
                onChange: (e) => setLogoPreview(String(e.target.value ?? '').trim()),
              })}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={2.5}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, minWidth: 160 }}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                {loading ? 'Creating…' : 'Create company'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                onClick={() => navigate(ROUTES.MASTER_ADMIN_COMPANIES)}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
