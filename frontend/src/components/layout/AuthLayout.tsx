import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
      px={2}
    >
      <Typography variant="h4" fontWeight={700} color="primary" mb={3}>
        TrackIt
      </Typography>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 440, p: 4 }}>
        <Outlet />
      </Paper>
    </Box>
  )
}
