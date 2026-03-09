import { Component, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" p={2}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
            <Typography variant="h6" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {this.state.message}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
