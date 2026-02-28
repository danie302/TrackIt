# Story 18.2-001: Frontend Security

## Metadata
- **Category**: Frontend - Security
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 7.1-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement frontend security with input sanitization, CSRF, and CSP.

## Tasks
1. Sanitize all user inputs with DOMPurify
2. Implement CSRF token handling
3. Configure Content Security Policy
4. Remove sensitive data from browser storage
5. Add XSS protection
6. Validate all forms client-side
7. Implement secure token storage

## Acceptance Criteria
- All user inputs sanitized
- CSRF tokens included in requests
- CSP configured
- Tokens stored securely
- XSS attacks prevented

## Technical Notes
```typescript
// Install and use DOMPurify
import DOMPurify from 'dompurify';

const sanitize = (input: string) => DOMPurify.sanitize(input);

// Store tokens in httpOnly cookies, not localStorage
// Add CSRF token to all mutating requests
apiClient.defaults.headers.common['X-CSRF-Token'] = getCsrfToken();
```

## Related Files
- `src/api/client.ts` (add CSRF)
- All form components (add sanitization)
