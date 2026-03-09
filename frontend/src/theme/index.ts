import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
    },
    secondary: {
      main: '#0288D1',
    },
    background: {
      default: '#F5F7FA',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
})
