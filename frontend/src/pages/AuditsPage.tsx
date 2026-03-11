import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Card from '@mui/material/Card'
import AuditHistory from '@/components/common/AuditHistory'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import { UserRole, AuditAction, EntityType } from '@/types/models'

export default function AuditsPage() {
  const user = useAuthStore((s) => s.user)
  const isReseller = user?.role === UserRole.RESELLER
  const isMasterAdmin = user?.role === UserRole.MASTER_ADMIN

  const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>('ALL')
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | 'ALL'>('ALL')

  const dashboardRoute = isMasterAdmin
    ? ROUTES.MASTER_ADMIN_DASHBOARD
    : isReseller
    ? ROUTES.RESELLER_DASHBOARD
    : ROUTES.COMPANY_ADMIN_DASHBOARD

  const actionProp = actionFilter !== 'ALL' ? actionFilter : undefined

  const auditProps = isReseller
    ? { mode: 'company' as const }
    : entityTypeFilter !== 'ALL'
    ? { mode: 'entity' as const, entityType: entityTypeFilter, entityId: undefined, action: actionProp }
    : { mode: 'company' as const, companyId: user?.companyId, action: actionProp }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to={dashboardRoute}
          variant="text"
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          Dashboard
        </Button>
        <Typography color="text.primary">Audits</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
        <Typography variant="h5" fontWeight={800}>
          Audit Log
        </Typography>
        {!isReseller && (
          <Stack direction="row" spacing={1}>
            <TextField
              select
              label="Entity type"
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value as EntityType | 'ALL')}
              sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              size="small"
            >
              <MenuItem value="ALL">All types</MenuItem>
              {Object.values(EntityType).map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Action"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as AuditAction | 'ALL')}
              sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              size="small"
            >
              <MenuItem value="ALL">All actions</MenuItem>
              {Object.values(AuditAction).map((a) => (
                <MenuItem key={a} value={a}>{a}</MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </Stack>

      <Card elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <AuditHistory {...auditProps} />
      </Card>
    </Box>
  )
}
