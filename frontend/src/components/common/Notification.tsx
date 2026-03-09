import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useUiStore } from '@/stores/ui.store'

export function Notification() {
  const notifications = useUiStore((s) => s.notifications)
  const dismissNotification = useUiStore((s) => s.dismissNotification)

  const current = notifications[0]

  if (!current) return null

  return (
    <Snackbar
      open
      autoHideDuration={4000}
      onClose={() => dismissNotification(current.id)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={current.severity}
        onClose={() => dismissNotification(current.id)}
        variant="filled"
      >
        {current.message}
      </Alert>
    </Snackbar>
  )
}
