import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { useAuthStore } from '@/stores/auth.store'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          ☰
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          TrackIt
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {user && (
            <>
              <Typography variant="body2">{user.name}</Typography>
              <Chip label={user.role} size="small" color="secondary" />
            </>
          )}
          <Button color="inherit" onClick={logout} size="small">
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
