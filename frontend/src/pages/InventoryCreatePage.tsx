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
import Alert from '@mui/material/Alert'
import { useInventoriesStore } from '@/stores/inventories.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'

interface FormValues {
  name: string
}

export default function InventoryCreatePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const notify = useUiStore((s) => s.notify)
  const { loading, error, createInventory } = useInventoriesStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '' },
  })

  const onSubmit = async (values: FormValues) => {
    if (!user?.companyId) return
    try {
      await createInventory({
        name: values.name.trim(),
        companyId: user.companyId,
        isResellerInventory: false,
      })
      notify('Inventory created', 'success')
      navigate(ROUTES.INVENTORIES)
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
          to={ROUTES.INVENTORIES}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Inventories
        </Button>
        <Typography color="text.primary">New Inventory</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={800} mb={3}>
        New Inventory
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card elevation={1} sx={{ borderRadius: 3, maxWidth: 520 }}>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                {...register('name', { required: 'Name is required' })}
              />

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" pt={1}>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  onClick={() => navigate(ROUTES.INVENTORIES)}
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
                  Create inventory
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
