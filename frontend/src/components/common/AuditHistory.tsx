import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'
import { useAuditsStore } from '@/stores/audits.store'
import { ROUTES } from '@/router/routes'
import type { AuditAction } from '@/types/models'

function actionColor(action: AuditAction) {
  switch (action) {
    case 'Create': return 'success' as const
    case 'Update': return 'info' as const
    case 'Delete': return 'error' as const
    case 'Approve': return 'success' as const
    case 'Reject': return 'error' as const
    case 'Deactivate': return 'warning' as const
    default: return 'default' as const
  }
}

interface Props {
  mode: 'company' | 'entity' | 'item'
  companyId?: string
  entityType?: string
  entityId?: string
  itemId?: string
  action?: string
}

export default function AuditHistory({ mode, companyId, entityType, entityId, itemId, action }: Props) {
  const navigate = useNavigate()
  const { audits, loading, error, fetchAudits, fetchEntityAudits, fetchItemAuditTrail } = useAuditsStore()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  const load = useCallback(() => {
    const p = { page: page + 1, limit }
    if (mode === 'company' && companyId) {
      void fetchAudits({ companyId, action: action || undefined, ...p })
    } else if (mode === 'entity' && entityType && entityId) {
      void fetchEntityAudits(entityType, entityId, p)
    } else if (mode === 'item' && itemId) {
      void fetchItemAuditTrail(itemId, p)
    }
  }, [mode, companyId, entityType, entityId, itemId, action, page, limit, fetchAudits, fetchEntityAudits, fetchItemAuditTrail])

  useEffect(() => { load() }, [load])

  if (loading && audits.data.length === 0) {
    return <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
  }

  if (audits.data.length === 0) {
    return <Typography variant="body2" color="text.secondary" py={2}>No audit records found.</Typography>
  }

  return (
    <Box>
      <Stack spacing={0}>
        {audits.data.map((audit, i) => (
          <Box
            key={audit._id}
            onClick={() => navigate(ROUTES.AUDIT_DETAIL.replace(':id', audit._id))}
            sx={{
              py: 1.5,
              px: 2,
              borderBottom: i < audits.data.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'grey.50' },
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <Chip
                label={audit.action}
                color={actionColor(audit.action as AuditAction)}
                size="small"
                variant="filled"
                sx={{ minWidth: 80, fontWeight: 700 }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {audit.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {audit.createdAt ? new Date(audit.createdAt).toLocaleString() : '—'}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>

      <TablePagination
        component="div"
        count={audits.total}
        page={page}
        rowsPerPage={limit}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setLimit(Number(e.target.value)); setPage(0) }}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Box>
  )
}
