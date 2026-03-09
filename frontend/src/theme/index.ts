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
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: ({ theme }) => ({
          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
            WebkitTextFillColor: 'inherit',
            caretColor: 'inherit',
            borderRadius: 'inherit',
          },
          '&:-webkit-autofill:focus': {
            WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
          },
          '&:-moz-autofill': {
            boxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
            caretColor: 'inherit',
            borderRadius: 'inherit',
          },
        }),
      },
    },
  },
})
