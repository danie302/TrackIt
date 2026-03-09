import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/theme'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { Notification } from '@/components/common/Notification'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)
  useEffect(() => { loadFromStorage() }, [loadFromStorage])

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Notification />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
