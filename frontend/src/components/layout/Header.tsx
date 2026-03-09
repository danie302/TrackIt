import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import { useAuthStore } from '@/stores/auth.store'
import AppLogo from '@/components/common/AppLogo'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #0D47A1 0%, #1565C0 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 1, display: { sm: 'none' } }}
        >
          ☰
        </IconButton>

        <Box display="flex" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
          <AppLogo size={32} variant="white" />
          <Typography variant="h6" fontWeight={800} letterSpacing={-0.3}>
            TrackIt
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          {user && (
            <>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {user.name}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, fontSize: 11 }}
                />
              </Box>
            </>
          )}
          <Button
            color="inherit"
            onClick={logout}
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 1.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
