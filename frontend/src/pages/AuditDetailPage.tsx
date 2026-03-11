import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useAuditsStore } from '@/stores/audits.store'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import { UserRole, type AuditActor, type AuditAction } from '@/types/models'

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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} py={1.25}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>
        {typeof value === 'string' || typeof value === 'number'
          ? <Typography variant="body2">{value}</Typography>
          : value}
      </Box>
    </Stack>
  )
}

/** Renders a { changes: {...} } metadata object as a diff-like table */
function ChangesTable({ changes }: { changes: Record<string, unknown> }) {
  const HIDDEN_FIELDS = ['password', 'passwordHash']
  const entries = Object.entries(changes).filter(([k]) => !HIDDEN_FIELDS.includes(k))
  if (entries.length === 0) return <Typography variant="body2" color="text.secondary">No details available.</Typography>
  return (
    <Table size="small">
      <TableBody>
        {entries.map(([key, value]) => (
          <TableRow key={key}>
            <TableCell sx={{ width: 160, fontWeight: 600, color: 'text.secondary', border: 0, py: 0.75 }}>
              {formatFieldName(key)}
            </TableCell>
            <TableCell sx={{ border: 0, py: 0.75, wordBreak: 'break-all' }}>
              {formatFieldValue(value)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatFieldName(key: string): string {
  // camelCase → Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function formatFieldValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <Typography variant="body2" color="text.disabled">—</Typography>
  if (typeof value === 'boolean') {
    return <Chip label={value ? 'Yes' : 'No'} size="small" color={value ? 'success' : 'default'} variant="outlined" />
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return <Typography variant="body2">{String(value)}</Typography>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <Typography variant="body2" color="text.disabled">Empty list</Typography>
    return (
      <Stack spacing={0.5}>
        {value.map((item, i) => (
          <Typography key={i} variant="body2">{String(item)}</Typography>
        ))}
      </Stack>
    )
  }
  return <Typography variant="body2" fontFamily="monospace" fontSize={12}>{JSON.stringify(value)}</Typography>
}

function MoveDetails({ metadata }: { metadata: Record<string, unknown> }) {
  const fromLabel = (metadata.fromInventoryName ?? metadata.fromInventoryId ?? '—') as string
  const toLabel = (metadata.toInventoryName ?? metadata.toInventoryId ?? '—') as string

  return (
    <Box>
      {metadata.serial && (
        <>
          <InfoRow label="Serial" value={String(metadata.serial)} />
          <Divider />
        </>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} py={1.5}>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 600 }}>
          Movement
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Chip label={fromLabel} size="small" variant="outlined" color="default" />
          <Typography variant="body2" color="text.secondary">→</Typography>
          <Chip label={toLabel} size="small" variant="filled" color="primary" />
        </Stack>
      </Stack>
    </Box>
  )
}

function OrderMetadata({ metadata }: { metadata: Record<string, unknown> }) {
  const sourceLabel = (metadata.sourceInventoryName ?? metadata.sourceInventoryId ?? '—') as string
  const targetLabel = (metadata.targetInventoryName ?? metadata.targetInventoryId ?? '—') as string
  const hasFlow = metadata.sourceInventoryId || metadata.targetInventoryId

  return (
    <Box>
      <InfoRow label="Order type" value={
        <Chip
          label={String(metadata.orderType ?? '—')}
          size="small"
          variant="outlined"
          color={metadata.orderType === 'Devolution' ? 'warning' : 'primary'}
          sx={{ fontWeight: 600 }}
        />
      } />
      <Divider />
      <InfoRow label="Items" value={`${metadata.itemCount ?? '—'} item(s)`} />
      {hasFlow && (
        <>
          <Divider />
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} py={1.5}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 600 }}>
              Inventory flow
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Chip label={sourceLabel} size="small" variant="outlined" />
              <Typography variant="body2" color="text.secondary">→</Typography>
              <Chip label={targetLabel} size="small" variant="filled" color="primary" />
            </Stack>
          </Stack>
        </>
      )}
      {metadata.devolutionReason && (
        <>
          <Divider />
          <InfoRow label="Reason" value={String(metadata.devolutionReason)} />
        </>
      )}
    </Box>
  )
}

/** Smart metadata renderer — picks the best layout based on metadata shape */
function MetadataSection({ metadata }: { metadata: Record<string, unknown> }) {
  // MOVE: item moved between inventories
  if (metadata.fromInventoryId || metadata.toInventoryId) {
    return <MoveDetails metadata={metadata} />
  }

  // Order create / approve (has orderType or itemCount)
  if (metadata.orderType !== undefined || metadata.itemCount !== undefined) {
    return <OrderMetadata metadata={metadata} />
  }

  // Rejection reason only
  if (metadata.rejectionReason && Object.keys(metadata).length === 1) {
    return (
      <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
        <Typography variant="body2" fontWeight={600} mb={0.25}>Rejection reason</Typography>
        <Typography variant="body2">{String(metadata.rejectionReason)}</Typography>
      </Alert>
    )
  }

  // Whitelist operations
  if (metadata.action === 'add_to_whitelist' || metadata.action === 'remove_from_whitelist') {
    const added = metadata.action === 'add_to_whitelist'
    return (
      <Box>
        <InfoRow label="Operation" value={
          <Chip
            label={added ? 'Added to whitelist' : 'Removed from whitelist'}
            size="small"
            color={added ? 'success' : 'error'}
            variant="filled"
          />
        } />
        {metadata.resellerId && (
          <>
            <Divider />
            <InfoRow label="Reseller ID" value={
              <Typography variant="body2" fontFamily="monospace" fontSize={12}>{String(metadata.resellerId)}</Typography>
            } />
          </>
        )}
      </Box>
    )
  }

  // Changes object (UPDATE operations)
  if (metadata.changes && typeof metadata.changes === 'object' && !Array.isArray(metadata.changes)) {
    return <ChangesTable changes={metadata.changes as Record<string, unknown>} />
  }

  // Inventory creation type flag
  if ('isResellerInventory' in metadata) {
    return (
      <InfoRow label="Inventory type" value={
        <Chip
          label={metadata.isResellerInventory ? 'Reseller inventory' : 'Company inventory'}
          size="small"
          variant="outlined"
          color={metadata.isResellerInventory ? 'secondary' : 'primary'}
        />
      } />
    )
  }

  // Item creation / deletion fields (serial, brand, role)
  if (metadata.serial !== undefined || metadata.brand !== undefined || metadata.role !== undefined) {
    const fields: Array<{ key: string; label: string }> = [
      { key: 'serial', label: 'Serial' },
      { key: 'brand', label: 'Brand' },
      { key: 'role', label: 'Role' },
    ]
    const visible = fields.filter(({ key }) => metadata[key] !== undefined)
    return (
      <Box>
        {visible.map(({ key, label }, i) => (
          <Box key={key}>
            <InfoRow label={label} value={
              key === 'role'
                ? <Chip label={String(metadata[key])} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                : String(metadata[key])
            } />
            {i < visible.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    )
  }

  // Fallback: readable key/value list for unknown shapes
  const entries = Object.entries(metadata)
  return (
    <Box>
      {entries.map(([key, value], i) => (
        <Box key={key}>
          <InfoRow label={formatFieldName(key)} value={formatFieldValue(value)} />
          {i < entries.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  )
}

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const { currentAudit, loading, error, fetchAuditById } = useAuditsStore()

  const isMasterAdmin = user?.role === UserRole.MASTER_ADMIN
  const isReseller = user?.role === UserRole.RESELLER

  const dashboardRoute = isMasterAdmin
    ? ROUTES.MASTER_ADMIN_DASHBOARD
    : isReseller
    ? ROUTES.RESELLER_DASHBOARD
    : ROUTES.COMPANY_ADMIN_DASHBOARD

  useEffect(() => {
    if (id) void fetchAuditById(id)
  }, [id, fetchAuditById])

  if (!id) return <Alert severity="error">Invalid audit id</Alert>

  if (loading) {
    return <Box display="flex" justifyContent="center" py={6}><CircularProgress size={28} /></Box>
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
  }

  if (!currentAudit) return null

  const actor = typeof currentAudit.actor === 'object' ? currentAudit.actor as AuditActor : null
  const actorId = typeof currentAudit.actor === 'string' ? currentAudit.actor : (currentAudit.actor as AuditActor)._id
  const hasMetadata = currentAudit.metadata && Object.keys(currentAudit.metadata).length > 0

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Button component={RouterLink} to={dashboardRoute} variant="text" sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}>
          Dashboard
        </Button>
        <Button component={RouterLink} to={ROUTES.AUDITS} variant="text" sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}>
          Audits
        </Button>
        <Typography color="text.primary">Audit Detail</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1.5} mb={3}>
        <Typography variant="h5" fontWeight={800} flex={1}>Audit Record</Typography>
        <Chip
          label={currentAudit.action}
          color={actionColor(currentAudit.action as AuditAction)}
          variant="filled"
          sx={{ fontWeight: 700, fontSize: 14 }}
        />
      </Stack>

      {/* Actor */}
      <Card elevation={1} sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={1}>
            Performed By
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {actor ? (
            <>
              <InfoRow label="Name" value={actor.name} />
              <Divider />
              <InfoRow label="Email" value={actor.email} />
              <Divider />
              <InfoRow label="Role" value={
                <Chip label={actor.role} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              } />
              <Divider />
              <InfoRow label="User ID" value={
                <Typography variant="body2" fontFamily="monospace" fontSize={12}>{actorId}</Typography>
              } />
            </>
          ) : (
            <InfoRow label="User ID" value={
              <Typography variant="body2" fontFamily="monospace" fontSize={12}>{actorId}</Typography>
            } />
          )}
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card elevation={1} sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={1}>
            Event Details
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <InfoRow label="Description" value={currentAudit.description} />
          <Divider />
          <InfoRow label="Entity Type" value={currentAudit.entityType} />
          <Divider />
          <InfoRow label="Entity ID" value={
            <Typography variant="body2" fontFamily="monospace" fontSize={12}>{currentAudit.entityId}</Typography>
          } />
          <Divider />
          <InfoRow label="Occurred At" value={
            currentAudit.createdAt ? new Date(currentAudit.createdAt).toLocaleString() : '—'
          } />
        </CardContent>
      </Card>

      {/* Smart Metadata */}
      {hasMetadata && (
        <Card elevation={1} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ pb: '16px !important' }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={1}>
              Additional Details
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <MetadataSection metadata={currentAudit.metadata!} />
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
