import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
      <Typography variant="h4">404 - Page Not Found</Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
    </Box>
  )
}
