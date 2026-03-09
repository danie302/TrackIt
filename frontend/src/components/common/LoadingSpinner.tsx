import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

interface LoadingSpinnerProps {
  fullPage?: boolean
}

export default function LoadingSpinner({ fullPage }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }
  return (
    <Box display="flex" alignItems="center" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  )
}
