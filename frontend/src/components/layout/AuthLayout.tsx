import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Navigate, Outlet } from 'react-router-dom'
import AppLogo from '@/components/common/AppLogo'
import { useAuthStore } from '@/stores/auth.store'

const features = [
  { icon: '📦', text: 'Track inventory across multiple locations' },
  { icon: '🔄', text: 'Manage order requests and devolutions' },
  { icon: '👥', text: 'Role-based access for your entire team' },
  { icon: '📋', text: 'Full audit trail for every action' },
]

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <Box display="flex" minHeight="100vh">
      {/* Left branding panel — hidden on mobile */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: '45%',
          paddingTop: 2,
          flexShrink: 0,
          px: 8,
          background: 'linear-gradient(145deg, #0D47A1 0%, #1565C0 45%, #0288D1 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background circles decoration */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            top: -100,
            right: -150,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            bottom: -80,
            left: -100,
          }}
        />

        {/* Logo + name */}
        <Box display="flex" alignItems="center" gap={2} mb={5}>
          <AppLogo size={52} variant="white" />
          <Typography variant="h4" fontWeight={800} color="white" letterSpacing={-0.5}>
            TrackIt
          </Typography>
        </Box>

        {/* Tagline */}
        <Typography variant="h5" color="white" fontWeight={600} mb={1.5} lineHeight={1.3}>
          Inventory management
          <br />made simple.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, fontSize: 15 }}>
          One platform to track items, manage teams, and audit every movement.
        </Typography>

        {/* Feature list */}
        <Box display="flex" flexDirection="column" gap={2}>
          {features.map(({ icon, text }) => (
            <Box key={text} display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.88)', fontSize: 14 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Bottom tagline */}
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, mt: 'auto', pt: 8 }}>
          © {new Date().getFullYear()} TrackIt. All rights reserved.
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        px={{ xs: 2, sm: 6, md: 8 }}
        py={6}
        bgcolor="#F8FAFC"
        sx={{ overflowY: 'auto' }}
      >
        {/* Mobile logo — only visible on small screens */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1.5,
            mb: 4,
          }}
        >
          <AppLogo size={40} />
          <Typography variant="h5" fontWeight={800} color="primary" letterSpacing={-0.5}>
            TrackIt
          </Typography>
        </Box>

        {/* Form card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: 'white',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
