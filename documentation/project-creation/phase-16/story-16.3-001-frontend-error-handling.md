# Story 16.3-001: Frontend Error Handling

## Metadata
- **Category**: Frontend - Error Handling
- **Priority**: High
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 7.4-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement error handling with interceptors, boundary, and retry logic.

## Tasks
1. Add Axios interceptor for error handling
2. Create ErrorBoundary component
3. Implement retry logic for failed requests
4. Add user-friendly error messages
5. Log errors to console in development

## Acceptance Criteria
- API errors caught and displayed
- ErrorBoundary catches React errors
- Failed requests retried automatically
- User sees friendly error messages

## Technical Notes
```typescript
// src/api/client.ts
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Alert severity="error">Something went wrong. Please refresh.</Alert>;
    }
    return this.props.children;
  }
}
```

## Related Files
- `src/api/client.ts` (update)
- `src/components/ErrorBoundary.tsx` (create)
